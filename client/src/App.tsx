import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  Paper,
} from "@mui/material";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { openDB } from 'idb';
import ThreadList from './components/ThreadList/ThreadList';
import ThreadView from './components/ThreadView/ThreadView';
import FileDropZone from './components/FileDropZone/FileDropZone';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import { Thread } from './types/email';

const MAX_SIZE_MB = 30;


// IndexedDB helpers
const DB_NAME = 'mboxViewerDB';
const STORE_NAME = 'threads';

async function getOrCreateDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

async function saveThreadsToIndexedDB(threads: Thread[]) {
  const db = await getOrCreateDB();
  await db.put(STORE_NAME, threads, 'cachedThreads');
  db.close();
}

async function loadThreadsFromIndexedDB(): Promise<Thread[] | null> {
  const db = await getOrCreateDB();
  const threads = await db.get(STORE_NAME, 'cachedThreads');
  db.close();
  return threads || null;
}

function App() {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<number>(0);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [saveToLocal, setSaveToLocal] = useState(true);
  const [checkingCache, setCheckingCache] = useState(true);
  const [sortOrder, setSortOrder] = useState<'last-desc' | 'last-asc' | 'first-desc' | 'first-asc'>('last-desc');
  const toggleCollapse = (idx: number) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const clearCacheAndReset = async () => {
    const db = await getOrCreateDB();
    await db.clear(STORE_NAME);
    db.close();
    setThreads([]);
    setSelected(0);
    setCollapsed(new Set());
    setError("");
  };

  // Reset collapsed state when selected thread changes
  useEffect(() => {
    setCollapsed(new Set());
  }, [selected]);

  // When loading from cache, default to first thread selected
  useEffect(() => {
    setCheckingCache(true);
    loadThreadsFromIndexedDB().then(cached => {
      if (cached && cached.length > 0) {
        setThreads(cached);
      }
      setCheckingCache(false);
    });
  }, []);

  const handleFile = async (file?: File) => {
    setError("");
    if (!file) return;
    if (!file.name.endsWith(".mbox") && !file.name.endsWith(".zip")) {
      setError("Please upload a .mbox or .zip file.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_SIZE_MB}MB limit.`);
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setThreads(data.threads);
      setSelected(0);
      // Only save to IndexedDB if caching is enabled at the time of upload
      if (saveToLocal) {
        try {
          await saveThreadsToIndexedDB(data.threads);
        } catch (e) {
          console.error('Error saving to IndexedDB', e);
        }
      }
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  if (checkingCache) {
    return <LoadingScreen message="Loading cached threads…" />;
  }

  if (loading) {
    return <LoadingScreen message="Processing mbox file…" />;
  }

  if (threads.length === 0) {
    return (
      <FileDropZone
        dragActive={dragActive}
        error={error}
        saveToLocal={saveToLocal}
        setSaveToLocal={setSaveToLocal}
        onFile={handleFile}
        setDragActive={setDragActive}
      />
    );
  }

  if (threads.length > 0) {
    // Sort threads by selected sort option
    const sortedThreads = [...threads].sort((a, b) => {
      const aLast = new Date(a.emails[a.emails.length - 1]?.date || 0).getTime();
      const bLast = new Date(b.emails[b.emails.length - 1]?.date || 0).getTime();
      const aFirst = new Date(a.emails[0]?.date || 0).getTime();
      const bFirst = new Date(b.emails[0]?.date || 0).getTime();
      switch (sortOrder) {
        case 'last-desc':
          return bLast - aLast;
        case 'last-asc':
          return aLast - bLast;
        case 'first-desc':
          return bFirst - aFirst;
        case 'first-asc':
          return aFirst - bFirst;
        default:
          return 0;
      }
    });
    const thread = sortedThreads[selected] || sortedThreads[0];
    return (
      <Box display="flex" minHeight="100vh" sx={{ bgcolor: 'grey.100' }}>
        <Paper
          className="mbox-left-column"
          sx={{
            width: 360,
            borderRadius: 0,
            height: '100vh',
            overflowY: 'auto',
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
          square
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'grey.200', bgcolor: 'grey.50', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Select
              size="small"
              value={sortOrder}
              onChange={e => {
                setSortOrder(e.target.value as any);
                setSelected(0); // reset selection to first thread
              }}
              sx={{ minWidth: 200, fontSize: 13 }}
            >
              <MenuItem value="last-desc">Most recent message: newest first</MenuItem>
              <MenuItem value="last-asc">Most recent message: oldest first</MenuItem>
              <MenuItem value="first-desc">First message: newest first</MenuItem>
              <MenuItem value="first-asc">First message: oldest first</MenuItem>
            </Select>
            <Button size="small" variant="outlined" color="secondary" onClick={clearCacheAndReset} sx={{ ml: 2, minWidth: 0, px: 1, py: 0.5, fontSize: 10, height: 24, lineHeight: '24px', display: 'flex', alignItems: 'center' }}>
              <span style={{ lineHeight: 'normal', display: 'block', marginTop: '1px' }}>New</span>
            </Button>
          </Box>
          <ThreadList threads={sortedThreads} selected={selected} onSelect={setSelected} />
        </Paper>
        <Divider orientation="vertical" flexItem />
        <Box
          flex={1}
          p={0}
          display="flex"
          flexDirection="column"
          sx={{
            height: '100vh',
            bgcolor: 'background.paper',
            maxWidth: '100vw',
            flexGrow: 1,
            boxSizing: 'border-box',
          }}
          className="mbox-main-column"
        >
          <ThreadView
            thread={thread}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
          />
        </Box>
      </Box>
    );
  }

  return null;
}

export default App;
