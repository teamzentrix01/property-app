import AdminUserQueue from "@/components/AdminUserQueue";
export default function ActiveUsersPage() { return <div><h2 className="mb-2 font-display text-3xl text-amber-950">Active Users</h2><p className="mb-6 text-sm text-slate-500">Users with all identity documents verified.</p><AdminUserQueue type="active" /></div>; }
