import React, { useRef, useEffect } from 'react';
import { Email } from '../../types/email';
import { Paper, Box, Typography, Divider, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AttachmentList from './AttachmentList';

interface EmailCardProps {
  email: Email;
  idx: number;
  isCollapsed: boolean;
  onToggleCollapse: (idx: number) => void;
}

const EmailCard: React.FC<EmailCardProps> = ({ email, idx, isCollapsed, onToggleCollapse }) => {
  // Separate inline and non-inline attachments
  const inlineImages = email.attachments.filter(
    (att) => att.isInline && att.contentType.startsWith('image/')
  );
  const otherAttachments = email.attachments.filter(
    (att) => !att.isInline
  );

  const cardRef = useRef<HTMLDivElement>(null);
  // Highlight state for anchor click
  const [highlight, setHighlight] = React.useState(false);

  useEffect(() => {
    if (highlight) {
      const timeout = setTimeout(() => setHighlight(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [highlight]);

  return (
    <Paper
      id={`email-card-${idx}`}
      tabIndex={-1}
      ref={cardRef}
      sx={{
        mb: 3,
        p: 2,
        boxShadow: 1,
        borderLeft: '4px solid',
        borderColor: highlight ? 'success.main' : 'primary.light',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s',
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mr: 1 }}>
          {email.sender}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(email.date).toLocaleString()}
        </Typography>
        <Box flex={1} />
        <Button
          size="small"
          onClick={() => onToggleCollapse(idx)}
          sx={{ minWidth: 0, ml: 1, p: 0.5, alignSelf: 'flex-start' }}
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
        </Button>
      </Box>
      {!isCollapsed && (
        <>
          <Typography variant="body2" color="text.secondary" mb={1}>
            To: {email.to}
            {email.cc && <><br />Cc: {email.cc}</>}
            {email.bcc && <><br />Bcc: {email.bcc}</>}
          </Typography>
          <Divider sx={{ my: 1 }} />
          <div
            style={{ fontFamily: 'monospace', whiteSpace: 'normal', fontSize: 15, marginBottom: 8 }}
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
          {/* Render inline images below the body */}
          {inlineImages.length > 0 && (
            <Box mt={2} mb={2}>
              {inlineImages.map((img, i) => (
                <img
                  key={i}
                  src={`data:${img.contentType};base64,${img.content}`}
                  alt={img.filename}
                  style={{
                    maxWidth: '100%',
                    display: 'block',
                    marginBottom: 8,
                    border: '1px solid #eee',
                    borderRadius: 4,
                  }}
                />
              ))}
            </Box>
          )}
          {/* Only show non-inline attachments in the list */}
          {otherAttachments.length > 0 && <AttachmentList attachments={otherAttachments} />}
        </>
      )}
    </Paper>
  );
};

export default EmailCard;
