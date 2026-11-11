import { useEffect } from "react";
import { Link, Redirect, useParams } from "wouter";
import ReactMarkdown from "react-markdown";
import Footer from "@/components/Footer";
import { POSTS, postDate, isLive } from "@/data/blog";
import { APP_STORE_URL } from "@/lib/links";

const TEXT = "#E8ECF1";
const BODY = "#C9D2DC";
const MUTED = "#8E9AA8";
const TINT = "#A9C3E0";
const RULE = "#1C2533";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = POSTS.find((p) => p.slug === slug && isLive(p));

  useEffect(() => {
    if (post) document.title = `${post.title} | PALE`;
  }, [post]);

  if (!post) return <Redirect to="/blog" replace />;

  return (
    <div className="min-h-screen pt-16" style={{ background: "#05070C" }}>
      <article className="max-w-[38rem] mx-auto px-5 md:px-0 pt-14 pb-10">
        <p className="m-0 text-[14px]">
          <Link href="/blog" className="no-underline hover:underline underline-offset-4" style={{ color: MUTED }}>Blog</Link>
          <span style={{ color: MUTED }}> · {postDate(post)}</span>
        </p>
        <h1 className="m-0 mt-3 text-[40px] md:text-[56px] leading-[1.05]" style={{ color: TEXT }}>{post.title}</h1>
        <p className="mt-3 mb-0 text-[15px]" style={{ color: MUTED }}>{post.week}</p>
        <p className="mt-6 mb-0 font-serif text-[22px] leading-snug" style={{ color: TEXT }}>{post.standfirst}</p>

        <div
          className="mt-10 text-[17px] leading-[1.7] flex flex-col gap-5 [&_p]:m-0 [&_strong]:font-normal [&_ul]:m-0 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_li]:marker:text-[#5D6B79] [&_a]:underline [&_a]:underline-offset-4"
          style={{ color: BODY }}
        >
          <ReactMarkdown
            components={{
              // A paragraph that is only bold text is a heading in the post.
              p: ({ node, children }) => {
                const only = node?.children.length === 1 && node.children[0].type === "element" && node.children[0].tagName === "strong";
                return only ? (
                  <h2 className="m-0 pt-6 text-[26px] leading-tight font-normal" style={{ color: TEXT }}>{children}</h2>
                ) : (
                  <p>{children}</p>
                );
              },
              strong: ({ children }) => <strong style={{ color: TEXT }}>{children}</strong>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: TINT }}>{children}</a>
              ),
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>

        {APP_STORE_URL && (
          <p className="mt-12 mb-0 pl-4 font-serif italic text-[19px] leading-snug" style={{ color: TEXT, borderLeft: "1px solid #F3DDB0" }}>
            The PALE app shows you what is in your sky each night, and gives you a quiet place to think about it.{" "}
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="not-italic underline underline-offset-4" style={{ color: TINT }}>
              Get it on the App Store
            </a>
          </p>
        )}

        {post.sources.length > 0 && (
          <section className="mt-12 pt-6" style={{ borderTop: `1px solid ${RULE}` }}>
            <h2 className="m-0 text-[15px] font-normal" style={{ color: MUTED }}>Sources</h2>
            <ul className="m-0 mt-3 pl-0 list-none space-y-2 text-[14px] leading-snug">
              {post.sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: BODY }}>{s.label}</a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 mb-0 text-[17px]">
          <Link href="/blog" className="underline underline-offset-4" style={{ color: TINT }}>More from the blog</Link>
        </p>
      </article>
      <Footer />
    </div>
  );
}
