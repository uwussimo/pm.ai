# Real-Time Updates Setup Guide

## Overview

The application uses Pusher for real-time collaboration features including:
- Live task updates
- Real-time cursor tracking
- Presence indicators (who's online)
- Live status updates

## Quick Setup

### 1. Create a Pusher Account

1. Go to [https://pusher.com](https://pusher.com)
2. Sign up for a free account
3. Create a new Channels app
4. Note down your credentials from the "App Keys" section

### 2. Configure Environment Variables

Create or update your `.env.local` file in the project root:

```env
# Pusher Configuration
PUSHER_APP_ID="your-app-id"
PUSHER_SECRET="your-secret-key"
NEXT_PUBLIC_PUSHER_KEY="your-public-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster"  # e.g., "us2", "eu", "ap1"
```

**Important:** 
- Replace the placeholder values with your actual Pusher credentials
- The `NEXT_PUBLIC_*` variables are exposed to the browser
- Restart your dev server after adding these variables

### 3. Enable Client Events (Required!)

In your Pusher dashboard:
1. Go to "App Settings"
2. Scroll to "Enable client events"
3. **Check the box** to enable client events
4. Save changes

This is required for cursor tracking to work!

### 4. Verify Setup

After configuring Pusher:

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Check the browser console** for these messages:
   - ✅ `Subscribing to presence channel: presence-project-{id}`
   - ✅ `Presence subscription succeeded`
   - ✅ `Subscribing to realtime channel: project-{id}`
   - ✅ `Realtime subscription succeeded for project: {id}`

3. **Test real-time updates:**
   - Open the same project in two browser windows (or incognito)
   - Create/update a task in one window
   - You should see:
     - `📤 Broadcasting task-updated to project-{id}`
     - `✅ Broadcast successful for task-updated`
     - `📨 Received task-updated` (in the other window)
     - The task updates automatically in both windows

## Troubleshooting

### Issue: "Pusher not configured" error

**Symptoms:**
- Console shows: `❌ Pusher not configured! Missing environment variables`

**Solution:**
1. Verify `.env.local` file exists in project root
2. Check all four Pusher variables are set
3. Restart the dev server: `npm run dev`

### Issue: Tasks not updating in real-time

**Symptoms:**
- You update a task but other windows don't see changes
- No broadcast messages in console

**Diagnostic steps:**

1. **Check console for connection messages:**
   ```
   Look for: "🟢 Subscribing to realtime channel"
   Should see: "✅ Realtime subscription succeeded"
   ```

2. **Check broadcast logs:**
   When you update a task, you should see:
   ```
   📤 Broadcasting task-updated to project-xxx
   ✅ Broadcast successful for task-updated
   ```

3. **Check if Pusher is in mock mode:**
   If server logs show: `Pusher environment variables not configured`
   - The server is using a mock Pusher instance
   - Add the variables to `.env.local` (not `.env`)

4. **Verify channel subscription:**
   Open browser DevTools → Network tab
   - Look for WebSocket connections to Pusher
   - Should see `ws://ws-{cluster}.pusher.com`

### Issue: Cursors not showing

**Symptoms:**
- Can't see other users' cursors
- Console shows: `❌ Client Events might not be enabled`

**Solution:**
1. Go to Pusher Dashboard → App Settings
2. Enable "Client Events"
3. Refresh the page

### Issue: "Unauthorized" or 403 errors

**Symptoms:**
- Console shows: `❌ Broadcast failed: {error: "Unauthorized"}`

**Solution:**
1. Make sure you're signed in
2. Verify you're a member of the project
3. Check that session is valid (try signing out and back in)

## Without Pusher (Development Only)

The app will work without Pusher, but real-time features will be disabled:
- ❌ No live updates when others edit tasks
- ❌ No cursor tracking
- ❌ No presence indicators
- ✅ Regular CRUD operations work fine
- ✅ You'll see updates when you refresh

## Architecture

### Real-time Flow

```
User Action (update task)
    ↓
useUpdateTask mutation
    ↓
API: PATCH /api/tasks/[taskId]
    ↓
broadcastTaskEvent("task-updated")
    ↓
API: POST /api/pusher/trigger
    ↓
Pusher Server
    ↓
All subscribed clients
    ↓
useRealtimeUpdates callback
    ↓
queryClient.invalidateQueries
    ↓
UI updates automatically
```

### Channels Used

1. **`project-{projectId}`** - Public channel for task/status updates
2. **`presence-project-{projectId}`** - Presence channel for online users and cursors

## Testing Checklist

- [ ] Environment variables configured
- [ ] Dev server restarted
- [ ] Client events enabled in Pusher dashboard
- [ ] Can see connection messages in console
- [ ] Task updates broadcast successfully
- [ ] Other windows receive updates
- [ ] Cursors visible when moving mouse
- [ ] Presence avatars show other users

## Need Help?

If real-time updates still aren't working:

1. Check the browser console for error messages
2. Look at the Network tab for failed requests
3. Verify Pusher credentials are correct
4. Try creating a new Pusher app and using those credentials
5. Check the Pusher dashboard "Debug Console" for incoming events

## Free Tier Limits

Pusher free tier includes:
- 200,000 messages per day
- 100 concurrent connections
- Unlimited channels

This is sufficient for most development and small team usage.
