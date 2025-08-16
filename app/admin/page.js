import Link from "next/link";
export default function AdminHome(){
  return (
    <main className="space-y-6">
      <h1 className="text-xl font-semibold">Teacher dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/quizzes" className="border rounded-xl p-4 hover:bg-slate-50">Generate quizzes</Link>
        <Link href="/admin/questions" className="border rounded-xl p-4 hover:bg-slate-50">Question bank</Link>
        <Link href="/admin/analytics" className="border rounded-xl p-4 hover:bg-slate-50">Analytics</Link>
      </div>
    </main>
  );
}
