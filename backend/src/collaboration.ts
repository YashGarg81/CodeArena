// backend/src/collaboration.ts
export interface RoomUser {
  socketId: string;
  userId: string;
  username: string;
  color: string;
  cursor?: { lineNumber: number; column: number };
}

export interface RoomMessage {
  id: string;
  sender: string;
  senderId?: string;
  text: string;
  time: string;
  timestamp: number;
}

export interface RoomState {
  roomId: string;
  code: string;
  language: string;
  users: Map<string, RoomUser>;
  messages: RoomMessage[];
}

class CollaborationEngine {
  private rooms: Map<string, RoomState> = new Map();
  private roomOwners: Map<string, string> = new Map(); // roomId -> ownerId
  private roomCollaborators: Map<string, Set<string>> = new Map(); // roomId -> Set of userIds

  getOrCreateRoom(roomId: string, initialCode = "", language = "javascript"): RoomState {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        roomId,
        code: initialCode,
        language,
        users: new Map(),
        messages: [
          {
            id: `msg_welcome_${Date.now()}`,
            sender: "CodeArena Bot",
            text: "👋 Welcome to the collaborative pair programming room! Share your invite link to code and chat in real-time.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
          }
        ]
      };
      this.rooms.set(roomId, room);
    }
    return room;
  }

  setRoomOwner(roomId: string, ownerId: string): void {
    this.roomOwners.set(roomId, ownerId);
    if (!this.roomCollaborators.has(roomId)) {
      this.roomCollaborators.set(roomId, new Set([ownerId]));
    }
  }

  createAuthorizedRoom(roomId: string, ownerId: string, initialCode = "", language = "javascript"): RoomState {
    this.setRoomOwner(roomId, ownerId);
    return this.getOrCreateRoom(roomId, initialCode, language);
  }

  addCollaborator(roomId: string, ownerOrCollab: string, maybeCollabId?: string): boolean {
    const collabId = maybeCollabId || ownerOrCollab;
    const owner = this.roomOwners.get(roomId);
    if (maybeCollabId && owner && owner !== ownerOrCollab) return false;
    if (!this.roomCollaborators.has(roomId)) {
      this.roomCollaborators.set(roomId, new Set(owner ? [owner] : []));
    }
    this.roomCollaborators.get(roomId)!.add(collabId);
    return true;
  }

  removeCollaborator(roomId: string, ownerId: string, collaboratorUserId: string): boolean {
    const owner = this.roomOwners.get(roomId);
    if (owner && owner !== ownerId) return false;
    const collabs = this.roomCollaborators.get(roomId);
    if (collabs) {
      collabs.delete(collaboratorUserId);
      return true;
    }
    return false;
  }

  isAuthorized(roomId: string, userId: string): boolean {
    if (!roomId || !userId) return false;
    const owner = this.roomOwners.get(roomId);
    if (!owner) return false; // Fail closed: unowned rooms require explicit creation/ownership
    if (owner === userId) return true;
    const collabs = this.roomCollaborators.get(roomId);
    return Boolean(collabs && collabs.has(userId));
  }

  joinRoom(roomId: string, socketId: string, user: { userId: string; username: string }): RoomUser {
    const room = this.getOrCreateRoom(roomId);
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
    const color = colors[room.users.size % colors.length] || "#ef4444";

    const roomUser: RoomUser = {
      socketId,
      userId: user.userId,
      username: user.username,
      color
    };

    room.users.set(socketId, roomUser);
    return roomUser;
  }

  leaveRoom(roomId: string, socketId: string): RoomUser | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    const user = room.users.get(socketId);
    room.users.delete(socketId);

    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }
    return user;
  }

  updateCode(roomId: string, code: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.code = code;
    }
  }

  updateCursor(roomId: string, socketId: string, cursor: { lineNumber: number; column: number }): void {
    const room = this.rooms.get(roomId);
    if (room) {
      const user = room.users.get(socketId);
      if (user) {
        user.cursor = cursor;
      }
    }
  }

  addMessage(roomId: string, message: { sender: string; senderId?: string; text: string }): RoomMessage {
    const room = this.getOrCreateRoom(roomId);
    const msg: RoomMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: message.sender,
      senderId: message.senderId,
      text: message.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };
    room.messages.push(msg);
    if (room.messages.length > 200) room.messages.shift();
    return msg;
  }

  getMessages(roomId: string): RoomMessage[] {
    const room = this.rooms.get(roomId);
    return room ? room.messages : [];
  }

  getRoomState(roomId: string): { code: string; language: string; users: RoomUser[]; messages: RoomMessage[] } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    return {
      code: room.code,
      language: room.language,
      users: Array.from(room.users.values()),
      messages: room.messages || []
    };
  }
}

export const collaborationEngine = new CollaborationEngine();
