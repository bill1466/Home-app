export type User = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  does_chores: 0 | 1;
  sort_order: number;
};

export type Notice = {
  id: number;
  title: string;
  details: string | null;
  event_date: string | null;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
};

export type DinnerIdea = {
  id: number;
  text: string;
  votes: number;
  votedByMe: boolean;
};

export type DinnerWinner = {
  date: string;
  ideas: string[];
  votes: number;
} | null;

export type DinnerLeaderboardEntry = {
  text: string;
  wins: number;
  totalVotes: number;
  lastWon: string;
};

export type DinnerHistoryEntry = {
  date: string;
  ideas: string[];
};

export type DinnerOverview = {
  voteDate: string;
  ideas: DinnerIdea[];
  tonight: DinnerWinner;
  leaderboard: DinnerLeaderboardEntry[];
  history: DinnerHistoryEntry[];
};

export type ChoreTask = {
  index: number;
  label: string;
  done: boolean;
};

export type ChoreRoomAssignment = {
  room: { id: number; name: string; emoji: string };
  user: { id: number; name: string; emoji: string; color: string } | null;
  tasks: ChoreTask[];
};

export type ChoresDay = {
  date: string;
  rooms: ChoreRoomAssignment[];
};

export type NoteReply = {
  id: number;
  note_id: number;
  author_id: number;
  author_name: string;
  author_emoji: string;
  body: string;
  created_at: string;
};

export type Note = {
  id: number;
  author_id: number;
  author_name: string;
  author_emoji: string;
  body: string;
  created_at: string;
  replies: NoteReply[];
};

export type Badge = {
  key: string;
  name: string;
  emoji: string;
  description: string;
  value: number;
  label: string;
  leaders: { id: number; name: string; emoji: string; color: string }[];
};

export type PersonStats = {
  id: number;
  name: string;
  emoji: string;
  color: string;
  loginStreak: number;
  loginDays: number;
  ideas: number;
  voteDays: number;
  chores: number;
  tidyDays: number;
  cleanSweepDays: number;
  notesAndReplies: number;
  activityTypes: number;
  badges: { key: string; emoji: string; name: string }[];
};

export type BadgesResponse = {
  badges: Badge[];
  people: PersonStats[];
  updatedAt: string;
};

export type CalendarEvent = {
  id: number;
  title: string;
  calendar_name: string;
  source: string;
  start_at: string;
  end_at: string | null;
  all_day: 0 | 1;
  location: string | null;
};

export type FamilyLink = {
  id: number;
  label: string;
  emoji: string;
  description: string | null;
  url: string | null;
  internal_route: string | null;
  sort_order: number;
};

export type GlanceResponse = {
  updatedAt: string;
  nextEvent: CalendarEvent | null;
  dinner: {
    tonight: DinnerWinner;
    voteDate: string;
    optionCount: number;
    totalVotes: number;
  };
  notes: { count: number; replyCount: number; latestAt: string | null };
  topPeople: PersonStats[];
  microMission: string;
};
