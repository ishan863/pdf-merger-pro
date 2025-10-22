/**
 * Collaboration System
 * Real-time collaboration features with Firestore listeners
 * Supports: presence, cursor tracking, live annotations, change broadcasting
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../utils/firebase';

interface UserPresence {
  userId: string;
  userName: string;
  userEmail: string;
  color: string;
  lastSeen: number;
  isOnline: boolean;
  currentPage?: number;
  cursor?: { x: number; y: number } | null;
}

interface ChangeEvent {
  id: string;
  userId: string;
  type: 'page-rotate' | 'page-delete' | 'page-reorder' | 'annotation' | 'text-change';
  data: any;
  timestamp: number;
}

interface CursorUpdate {
  userId: string;
  userName: string;
  color: string;
  position: { x: number; y: number };
  timestamp: number;
}

const PRESENCE_TIMEOUT = 30000; // 30 seconds
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

export const useCollaboration = (docId: string, userId: string, userName: string) => {
  const [participants, setParticipants] = useState<Map<string, UserPresence>>(new Map());
  const [cursors, setCursors] = useState<Map<string, CursorUpdate>>(new Map());
  const presenceRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Get consistent color for user
  const getUserColor = useCallback(() => {
    const hash = userId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    return COLORS[hash % COLORS.length];
  }, [userId]);

  /**
   * Initialize collaboration session
   */
  const initializeSession = useCallback(async () => {
    try {
      // Create session document
      const sessionDocRef = doc(collection(db, 'collab_sessions'));
      const sessionId = sessionDocRef.id;

      await setDoc(sessionDocRef, {
        docId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Create presence document
      const presenceDocRef = doc(
        collection(db, 'collab_sessions', sessionId, 'participants'),
        userId
      );

      await setDoc(presenceDocRef, {
        userId,
        userName,
        userEmail: '', // Would come from auth context
        color: getUserColor(),
        lastSeen: Date.now(),
        isOnline: true,
        currentPage: 1,
        cursor: undefined,
      } as UserPresence);

      presenceRef.current = presenceDocRef.path;
      sessionIdRef.current = sessionId;

      return sessionId;
    } catch (error) {
      console.error('Failed to initialize session:', error);
      throw error;
    }
  }, [docId, userId, userName, getUserColor]);

  /**
   * Subscribe to participants
   */
  const subscribeToParticipants = useCallback(
    (sessionId: string) => {
      try {
        const q = query(
          collection(db, 'collab_sessions', sessionId, 'participants'),
          where('isOnline', '==', true)
        );

        const unsubscribe = onSnapshot(q, snapshot => {
          const updatedParticipants = new Map<string, UserPresence>();

          snapshot.docs.forEach(doc => {
            const data = doc.data() as UserPresence;

            // Check if presence is stale
            if (Date.now() - data.lastSeen < PRESENCE_TIMEOUT) {
              updatedParticipants.set(doc.id, data);
            }
          });

          setParticipants(updatedParticipants);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error subscribing to participants:', error);
        return () => {};
      }
    },
    []
  );

  /**
   * Subscribe to changes
   */
  const subscribeToChanges = useCallback(
    (sessionId: string, onChangeCallback?: (change: ChangeEvent) => void) => {
      try {
        const changesRef = collection(db, 'collab_sessions', sessionId, 'changes');

        const unsubscribe = onSnapshot(changesRef, snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const changeData = change.doc.data() as ChangeEvent;
              onChangeCallback?.(changeData);
            }
          });
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error subscribing to changes:', error);
        return () => {};
      }
    },
    []
  );

  /**
   * Update user presence
   */
  const updatePresence = useCallback(
    async (_sessionId: string, updates: Partial<UserPresence>) => {
      if (!presenceRef.current) return;

      try {
        const presenceDocRef = doc(db, presenceRef.current);
        await setDoc(
          presenceDocRef,
          {
            ...updates,
            lastSeen: Date.now(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    },
    []
  );

  /**
   * Broadcast cursor position
   */
  const broadcastCursor = useCallback(
    async (_sessionId: string, position: { x: number; y: number }) => {
      if (!presenceRef.current) return;

      try {
        const presenceDocRef = doc(db, presenceRef.current);
        await setDoc(
          presenceDocRef,
          {
            cursor: position,
            lastSeen: Date.now(),
          },
          { merge: true }
        );

        // Update local cursors map
        setCursors(prev => {
          const next = new Map(prev);
          next.set(userId, {
            userId,
            userName,
            color: getUserColor(),
            position,
            timestamp: Date.now(),
          });
          return next;
        });
      } catch (error) {
        console.error('Error broadcasting cursor:', error);
      }
    },
    [userId, userName, getUserColor]
  );

  /**
   * Broadcast a change event
   */
  const broadcastChange = useCallback(
    async (sessionId: string, changeEvent: Omit<ChangeEvent, 'id' | 'userId' | 'timestamp'>) => {
      try {
        const changesRef = collection(db, 'collab_sessions', sessionId, 'changes');
        await addDoc(changesRef, {
          ...changeEvent,
          userId,
          timestamp: Timestamp.now(),
        });
      } catch (error) {
        console.error('Error broadcasting change:', error);
      }
    },
    [userId]
  );

  /**
   * Leave session
   */
  const leaveSession = useCallback(async (_sessionId: string) => {
    if (!presenceRef.current) return;

    try {
      // Mark as offline instead of deleting
      const presenceDocRef = doc(db, presenceRef.current);
      await setDoc(
        presenceDocRef,
        {
          isOnline: false,
          lastSeen: Date.now(),
        },
        { merge: true }
      );

      presenceRef.current = null;
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  }, []);

  /**
   * Subscribe to cursor updates from other participants
   */
  useEffect(() => {
    if (!sessionIdRef.current) return;

    const participantsRef = collection(
      db,
      'collab_sessions',
      sessionIdRef.current,
      'participants'
    );

    const unsubscribe = onSnapshot(participantsRef, snapshot => {
      const updatedCursors = new Map<string, CursorUpdate>();

      snapshot.docs.forEach(participantDoc => {
        const data = participantDoc.data() as UserPresence;

        if (data.userId !== userId && data.cursor && Date.now() - data.lastSeen < PRESENCE_TIMEOUT) {
          updatedCursors.set(data.userId, {
            userId: data.userId,
            userName: data.userName,
            color: data.color,
            position: data.cursor,
            timestamp: data.lastSeen,
          });
        }
      });

      setCursors(updatedCursors);
    });

    return unsubscribe;
  }, [userId]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (sessionIdRef.current) {
        leaveSession(sessionIdRef.current).catch(console.error);
      }
    };
  }, [leaveSession]);

  return {
    initializeSession,
    subscribeToParticipants,
    subscribeToChanges,
    updatePresence,
    broadcastCursor,
    broadcastChange,
    leaveSession,
    participants,
    cursors,
    sessionRef: sessionIdRef.current,
  };
};

export default useCollaboration;
