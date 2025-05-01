import React from 'react';
import { Attachment } from '../../types/email';
import { Box, Typography, List, ListItem } from '@mui/material';

interface AttachmentListProps {
  attachments: Attachment[];
}

const AttachmentList: React.FC<AttachmentListProps> = ({ attachments }) => (
  <Box mt={2}>
    <Typography variant="subtitle2" fontWeight={700}>Attachments:</Typography>
    <List>
      {attachments.map((att, i) => (
        <ListItem key={i} disableGutters>
          <a
            href={`data:${att.contentType};base64,${att.content}`}
            download={att.filename}
            style={{ wordBreak: 'break-all' }}
          >
            {att.filename}
          </a>
        </ListItem>
      ))}
    </List>
  </Box>
);

export default AttachmentList;
