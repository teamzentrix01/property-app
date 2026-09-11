import AdminUserQueue from "@/components/AdminUserQueue";
export default function RejectedUsersPage() { return <div><h2 className="mb-2 font-display text-3xl text-gray-950">Rejected Users</h2><p className="mb-6 text-sm text-slate-500">Rejected or expired verification submissions.</p><AdminUserQueue type="rejected" /></div>; }
