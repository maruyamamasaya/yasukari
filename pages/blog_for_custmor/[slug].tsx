import fs from 'fs'
import path from 'path'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import CalendarWidget, { CalendarPost } from '../../components/CalendarWidget'
import PostSearch from '../../components/PostSearch'

function parseMarkdown(md: string): { html: string; meta: Record<string, string> } {
  const meta: Record<string, string> = {}
  let content = md
  const fm = md.match(/^---\n([\s\S]*?)\n---\n?/)
  if (fm) {
    content = md.slice(fm[0].length)
    fm[1].split(/\r?\n/).forEach((line) => {
      const [k, ...v] = line.split(':')
      if (k) meta[k.trim()] = v.join(':').trim().replace(/^"|"$/g, '')
    })
  }

  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const lines = content.split(/\r?\n/)
  let html = ''
  let inCode = false
  let inList = false

  for (const line of lines) {
    if (inCode) {
      if (line.startsWith('```')) {
        html += '</code></pre>\n'
        inCode = false
      } else {
        html += escapeHtml(line) + '\n'
      }
      continue
    }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      html += `<pre class="code-block"><code class="language-${lang}">`
      inCode = true
      continue
    }

    if (/^- /.test(line)) {
      if (!inList) {
        html += '<ul>\n'
        inList = true
      }
      html += `<li>${line.slice(2)}</li>\n`
      continue
    }

    if (inList) {
      html += '</ul>\n'
      inList = false
    }

    if (line.startsWith('### ')) {
      html += `<h3>${line.slice(4)}</h3>\n`
    } else if (line.startsWith('## ')) {
      html += `<h2>${line.slice(3)}</h2>\n`
    } else if (line.startsWith('# ')) {
      html += `<h1>${line.slice(2)}</h1>\n`
    } else if (line.trim() === '') {
      html += ''
    } else {
      html += `<p>${line}</p>\n`
    }
  }

  if (inList) html += '</ul>\n'
  if (inCode) html += '</code></pre>\n'

  return { html, meta }
}

interface Props {
  html: string
  meta: Record<string, string>
  posts: CalendarPost[]
}

export default function BlogPost({ html, meta, posts }: Props) {
  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-row flex-wrap gap-6">
      <Head>
        <title>{meta.title ? `${meta.title} - yasukari` : 'ブログ'}</title>
        {meta.eyecatch && (
          <meta property="og:image" content={meta.eyecatch} />
        )}
      </Head>
      <article className="markdown-body w-[70%]">
        {meta.title && (
          <header className="post-header">
            <h1 className="post-title">{meta.title}</h1>
            {meta.date && <p className="post-date">{meta.date}</p>}
            {meta.tags && (
              <p className="post-tags space-x-2 mt-1">
                {meta.tags.split(',').map((tag) => (
                  <span key={tag.trim()} className="text-blue-600 text-xs">
                    #{tag.trim()}
                  </span>
                ))}
              </p>
            )}
          </header>
        )}
        {meta.eyecatch && (
          <img
            src={meta.eyecatch}
            alt={meta.title || ''}
            className="square-img rounded mb-4"
          />
        )}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      <div className="w-[25%] space-y-4">
        <CalendarWidget posts={posts} />
        <PostSearch posts={posts} basePath="/blog_for_custmor" />
      </div>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = () => {
  const dir = path.join(process.cwd(), 'blog_for_custmor')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
  const paths = files.map((file) => ({ params: { slug: file.replace(/\.md$/, '') } }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = ({ params }) => {
  const slug = params!.slug as string
  const dir = path.join(process.cwd(), 'blog_for_custmor')
  const filePath = path.join(dir, `${slug}.md`)
  const md = fs.readFileSync(filePath, 'utf8')
  const { html, meta } = parseMarkdown(md)

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
  const posts: CalendarPost[] = files.map((file) => {
    const s = file.replace(/\.md$/, '')
    const lines = fs.readFileSync(path.join(dir, file), 'utf8').split(/\r?\n/)
    const heading = lines.find((l) => l.startsWith('# '))
    const title = heading ? heading.replace(/^#\s*/, '') : s
    const dateMatch = s.match(/^\d{4}-\d{2}-\d{2}/)
    const date = dateMatch ? dateMatch[0] : ''
    return { slug: s, title, date }
  })

  return { props: { html, meta, posts } }
}
