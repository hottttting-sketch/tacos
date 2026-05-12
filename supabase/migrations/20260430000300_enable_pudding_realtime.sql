-- =============================================
-- 20260430000300_enable_pudding_realtime.sql
-- Description: Enable Supabase Realtime for Pudding chat.
-- =============================================

-- 1. Add tables to the realtime publication
-- Note: 'supabase_realtime' publication usually exists by default in Supabase.
-- If it doesn't, this will fail and we might need to create it.

BEGIN;
  -- Enable for chat messages
  ALTER PUBLICATION supabase_realtime ADD TABLE pudding.chat_messages;
  
  -- Enable for chat channels (if we want to see new channels in real-time)
  ALTER PUBLICATION supabase_realtime ADD TABLE pudding.chat_channels;
COMMIT;
