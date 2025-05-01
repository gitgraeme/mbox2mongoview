import React, { useRef } from 'react';
import { Box, Typography, Button, FormControlLabel, Switch } from '@mui/material';

interface FileDropZoneProps {
  dragActive: boolean;
  error: string;
  saveToLocal: boolean;
  setSaveToLocal: (checked: boolean) => void;
  onFile: (file?: File) => void;
  setDragActive: (active: boolean) => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  dragActive,
  error,
  saveToLocal,
  setSaveToLocal,
  onFile,
  setDragActive,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    onFile(file);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: dragActive ? 'grey.100' : 'background.default',
        transition: 'background 0.2s',
      }}
      onDragOver={e => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={e => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={handleDrop}
    >
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          Drop your .mbox or .zip file here
        </Typography>
        <Typography variant="body1" gutterBottom>
          (You can upload a .mbox file directly, or a .zip containing one or more .mbox files)
        </Typography>
        <Typography variant="body1" gutterBottom>
          or
        </Typography>
        <Button
          variant="contained"
          onClick={() => inputRef.current?.click()}
          sx={{ mt: 1 }}
        >
          Select File
        </Button>
        <Box sx={{ mt: 2, mb: 1 }}>
          <FormControlLabel
            control={<Switch checked={saveToLocal} onChange={e => setSaveToLocal(e.target.checked)} />}
            label="Cache emails in browser storage"
          />
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept=".mbox,.zip"
          style={{ display: 'none' }}
          onChange={e => onFile(e.target.files?.[0])}
        />
        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default FileDropZone;
