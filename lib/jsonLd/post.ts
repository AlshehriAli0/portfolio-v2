import { Post } from '@/lib/articles';

export const createPostJsonLd = (post: Post) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta.title,
    url: `https://alialshehri.works/posts/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    author: [
      {
        '@type': 'Person',
        name: 'Ali Alshehri',
        url: 'https://alialshehri.works',
      },
    ],
  };
};
