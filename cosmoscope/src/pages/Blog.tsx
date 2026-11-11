import { useEffect } from "react";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import { SORTED_POSTS, postDate, isLive } from "@/data/blog";

const TEXT = "#E8ECF1";
const BODY = "#C9D2DC";
const MUTED = "#8E9AA8";
const WARM = "#F3DDB0";
const RULE = "#1C2533";

export default function Blog() {
  useEffect(() => {
    document.title = "Blog | PALE";
  }, []);
  const posts = SORTED_POSTS.filter((p) => isLive(p));

  return (
    <div className="min-h-screen pt-16" style={{ background: "#05070C" }}>
      <div className="max-w-[40rem] mx-auto px-5 md:px-0 pt-14">
        <h1 className="m-0 text-[40px] md:text-[56px] leading-[1.05]" style={{ color: TEXT }}>Blog</h1>
        <p className="mt-4 mb-10 text-[17px] leading-relaxed" style={{ color: BODY }}>
          Every week, what happened in space, and what to look up for.
        </p>

        {posts.map((post, i) => (
          <article key={post.slug} className="py-10" style={{ borderTop: `1px solid ${RULE}` }}>
            <p className="m-0 text-[14px]" style={{ color: i === 0 ? WARM : MUTED }}>
              {i === 0 ? `Latest, ${postDate(post)}` : postDate(post)}
            </p>
            <h2 className="m-0 mt-2 text-[30px] md:text-[36px] leading-tight font-normal">
              <Link href={`/blog/${post.slug}`} className="no-underline hover:underline underline-offset-4" style={{ color: TEXT }}>
                {post.title}
              </Link>
            </h2>
            <p className="m-0 mt-3 text-[17px] leading-[1.7]" style={{ color: BODY }}>{post.standfirst}</p>
            <p className="m-0 mt-4 text-[15px]">
              <Link href={`/blog/${post.slug}`} className="underline underline-offset-4" style={{ color: "#A9C3E0" }}>
                Read the post
              </Link>
            </p>
          </article>
        ))}
      </div>
      <Footer />
    </div>
  );
}
