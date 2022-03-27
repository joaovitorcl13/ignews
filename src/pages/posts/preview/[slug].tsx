import { GetStaticPaths, GetStaticProps } from "next";
import { getPrismicClient } from "../../../services/prismicio";
import { RichText, RichTextBlock} from 'prismic-reactjs';
import Head from "next/head";

import styles from '../post.module.scss'
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { route } from "next/dist/server/router";

interface PostPreviewProps{
    post:{

        slug: string;
        title: string;
        content: RichTextBlock[];
        updatedAt: string;
    }
}

export default function postPreview({ post }: PostPreviewProps){
    const {data: session} = useSession();

    const router = useRouter();

    useEffect(()=>{
        if(session?.activeSubscription && post?.slug){
          router.push(`/posts/${post.slug}`)
        }

    }, [session])


    return(
       <>
       <Head>
           <title>{post.title} | ig.news</title>
       </Head>

       <main className={styles.container}>
           <article className={styles.post}>
               <h1>{post.title}</h1>
                <time>{post.updatedAt}</time>
                <div className={`${styles.postContent} ${styles.previewContent}`}>
                    <RichText render={post.content} />
                </div>

                <div className={styles.continueReading}>
                    Wanna continue reading?
                    <Link href="/">
                        <a>Subscribe now 🤗</a>
                    </Link>
                </div>
           </article>
       </main>
       </>
    
    )
}

export const getStaticPaths: GetStaticPaths = () => {
    return {
        paths: [],
        fallback: "blocking",
    }
}

export const getStaticProps: GetStaticProps = async ({ params}) => {
    const {slug} = params;

    const prismic = getPrismicClient();

    const response = await prismic.getByUID('publication', String(slug));
    
    console.log(response)

    const post = {
        slug,
        title: response.data.title,
        content: response.data.content.splice(0, 3),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
        
    }

    return {
    props: {
        post,
    },
    redirect: 60 * 30, // 30 minutos
  }
}