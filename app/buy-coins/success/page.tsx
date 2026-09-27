import Link from 'next/link'

export default async function PurchaseSuccessPage({ searchParams }: { searchParams: Promise<{ coins?: string }> }) {
  const { coins } = await searchParams
  return (
    <main className="grid min-h-screen place-items-center bg-[#080808] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-[#d6ff38]/30 bg-[#111] p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d6ff38]">Payment verified</p>
        <h1 className="mt-4 text-4xl font-black">Coins added</h1>
        <p className="mt-3 text-white/60">{Number(coins || 0).toLocaleString()} coins were credited to your wallet.</p>
        <Link href="/arena" className="mt-8 inline-block rounded-xl bg-[#d6ff38] px-5 py-3 font-black text-black">Return to Arena</Link>
      </div>
    </main>
  )
}
