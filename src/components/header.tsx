import Link from 'next/link'

export function Header() {
  return (
    <header className="w-full h-20 bg-gray-700 shadow-lg shadow-gray-900/50 flex items-center justify-center">
      <section className="px-6 w-full max-w-[1240px] flex items-center justify-between">
        <nav className="flex items-center">
          <Link href="/">
            <h1 className="font-heading text-center text-3xl leading-none font-medium flex flex-rol md:text-4xl">
              Taref
              <span className="text-blue-500">inhas</span>
            </h1>
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-1.5 rounded-xl bg-gray-100 text-gray-900 cursor-pointer mx-5 hover:opacity-90 transition-all duration-300"
          >
            Minhas Tarefas
          </Link>
        </nav>

        <button className="button">Acessar</button>
      </section>
    </header>
  )
}
