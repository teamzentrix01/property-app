import AdminUserQueue from "@/components/AdminUserQueue";
export default function PendingUsersPage() { return <div><h2 className="mb-2 font-display text-3xl text-amber-950">Pending Users</h2><p className="mb-6 text-sm text-slate-500">Users awaiting identity verification.</p><AdminUserQueue type="pending" /></div>; }
