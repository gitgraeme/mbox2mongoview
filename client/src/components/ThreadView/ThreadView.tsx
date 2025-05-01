import React, { useState, useEffect } from "react";
import { Thread } from "../../types/email";
import EmailCard from "./EmailCard";
import { Box, Typography, Link, List, ListItem, IconButton, Tooltip } from "@mui/material";
import UnfoldLessDoubleIcon from "@mui/icons-material/UnfoldLessDouble";
import UnfoldMoreDoubleIcon from "@mui/icons-material/UnfoldMoreDouble";

interface ThreadViewProps {
  thread: Thread;
  collapsed: Set<number>;
  onToggleCollapse: (idx: number) => void;
}

const ThreadView: React.FC<ThreadViewProps> = ({ thread, collapsed, onToggleCollapse }) => {
  const [showAttachments, setShowAttachments] = useState(false);
  // Close attachments list when thread changes
  useEffect(() => {
    setShowAttachments(false);
  }, [thread]);
  // Flatten all attachments in the thread
  const allAttachments = thread.emails.flatMap((email, emailIdx) =>
    email.attachments.filter((att) => !att.isInline).map((att) => ({ ...att, emailIdx }))
  );

  const handleExpandAll = () => {
    // Expand all: remove all indices from collapsed set
    if (thread && thread.emails.length > 0) {
      for (let i = 0; i < thread.emails.length; ++i) {
        if (collapsed.has(i)) onToggleCollapse(i);
      }
    }
  };

  const handleCollapseAll = () => {
    // Collapse all: add all indices to collapsed set
    if (thread && thread.emails.length > 0) {
      for (let i = 0; i < thread.emails.length; ++i) {
        if (!collapsed.has(i)) onToggleCollapse(i);
      }
    }
  };

  return (
    <>
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "grey.200",
          bgcolor: "grey.50",
          minHeight: 64,
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        {/* Subject and message count aligned left */}
        <Box
          sx={{
            p: 1,
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom mb={0}>
            {thread.subject}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {thread.emails.length} messages
          </Typography>
          {allAttachments.length > 0 && (
            <Typography variant="subtitle2" color="text.secondary">
              <Link
                component="button"
                variant="body2"
                onClick={() => setShowAttachments((v) => !v)}
                underline="hover"
                sx={{ fontWeight: 700 }}
              >
                {allAttachments.length} attachment{allAttachments.length > 1 ? "s" : ""}
              </Link>
            </Typography>
          )}
          {showAttachments && allAttachments.length > 0 && (
            <Box mt={2} mb={2}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Attachments in this thread:
              </Typography>
              <List dense>
                {allAttachments.map((att, i) => (
                  <ListItem key={i} disableGutters>
                    <Typography
                      variant="caption"
                      color="primary"
                      component="a"
                      href={`#email-card-${att.emailIdx}`}
                      sx={{ mr: 1, cursor: "pointer", textDecoration: "none" }}
                      title="Go to message"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowAttachments(false);
                        setTimeout(() => {
                          const el = document.getElementById(`email-card-${att.emailIdx}`);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "center" });
                            if (el.focus) el.focus();
                          }
                        }, 0);
                      }}
                    >
                      ✉️
                    </Typography>
                    <a
                      href={`data:${att.contentType};base64,${att.content}`}
                      download={att.filename}
                      style={{ wordBreak: "break-all", marginRight: 8 }}
                    >
                      {att.filename}
                    </a>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
        {/* Buttons aligned right */}
        <Box className="mbox-header-buttons" sx={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
          <Tooltip title="Expand all emails">
            <IconButton size="small" onClick={handleExpandAll} sx={{ mr: 1 }} aria-label="Expand all">
              <UnfoldMoreDoubleIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Collapse all emails">
            <IconButton size="small" onClick={handleCollapseAll} aria-label="Collapse all">
              <UnfoldLessDoubleIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print this thread">
            <IconButton aria-label="Print thread" onClick={() => window.print()} size="small" sx={{ p: 0.5, ml: 1 }}>
              <span role="img" aria-label="Print" style={{ fontSize: 18 }}>
                🖨️
              </span>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box flex={1} overflow="auto" p={3}>
        {thread.emails.map((email, idx) => (
          <EmailCard
            key={idx}
            email={email}
            idx={idx}
            isCollapsed={collapsed.has(idx)}
            onToggleCollapse={onToggleCollapse}
          />
        ))}
      </Box>
    </>
  );
};

export default ThreadView;
