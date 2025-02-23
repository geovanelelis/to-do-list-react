import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <div>
      <Head>
        <title>To Do List</title>
      </Head>

      <main className="max-w-[1240px] mx-auto px-5 py-8 md:py-0">
        <div className="height-home flex items-center justify-center gap-16 flex-col">
          <div className="flex flex-col gap-8 items-center">
            <Image
              src="/todolist.png"
              alt="Imagem de uma pessoa escrevendo uma lista de tarefas"
              width={'480'}
              height={'480'}
              priority
            />

            <h1 className="font-heading text-center text-3xl leading-10 font-medium max-w-2xl flex flex-col md:text-4xl">
              SISTEMA FEITO PARA VOCÊ ORGANIZAR SEUS ESTUDOS E TAREFAS
            </h1>

            <div>
              <section className="flex flex-row gap-16">
                <span className="button">Tarefas Arquivadas</span>
              </section>
            </div>
          </div>
        </div>
        <h1></h1>
      </main>
    </div>
  )
}
