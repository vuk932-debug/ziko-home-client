import apiClient from './axios';

export interface BlogAuthor {
  id: string;
  name: string;
  email: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  authorId: string;
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED';
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  author: BlogAuthor;
}

export interface FetchBlogsParams {
  status?: string;
  authorId?: string;
  page?: number;
  limit?: number;
}

export interface FetchBlogsResult {
  blogs: Blog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function fetchPublicBlogs(params: FetchBlogsParams): Promise<FetchBlogsResult> {
  const { data } = await apiClient.get('/blogs/public', { params });
  return data;
}

export async function fetchPublicBlogBySlug(slug: string): Promise<Blog> {
  const { data } = await apiClient.get(`/blogs/public/${slug}`);
  return data;
}

export async function fetchAdminBlogs(params: FetchBlogsParams): Promise<FetchBlogsResult> {
  const { data } = await apiClient.get('/blogs', { params });
  return data;
}

export async function fetchBlogById(id: string): Promise<Blog> {
  const { data } = await apiClient.get(`/blogs/${id}`, { params: { isId: true } });
  return data;
}

export async function createBlog(blogData: Partial<Blog> & { imageFile?: File }): Promise<Blog> {
  const formData = new FormData();
  const allowedFields = ['title', 'content', 'excerpt', 'featuredImage', 'seoTitle', 'seoDescription'];
  
  Object.entries(blogData).forEach(([key, value]) => {
    if (key === 'imageFile' && value) {
      formData.append('imageFile', value as File);
    } else if (allowedFields.includes(key) && value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const { data } = await apiClient.post('/blogs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.blog;
}

export async function updateBlog(id: string, blogData: Partial<Blog> & { imageFile?: File }): Promise<Blog> {
  const formData = new FormData();
  const allowedFields = ['title', 'content', 'excerpt', 'featuredImage', 'seoTitle', 'seoDescription', 'status'];

  Object.entries(blogData).forEach(([key, value]) => {
    if (key === 'imageFile' && value) {
      formData.append('imageFile', value as File);
    } else if (allowedFields.includes(key) && value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const { data } = await apiClient.put(`/blogs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.blog;
}

export async function deleteBlog(id: string): Promise<void> {
  await apiClient.delete(`/blogs/${id}`);
}

export async function submitBlogForReview(id: string): Promise<Blog> {
  const { data } = await apiClient.post(`/blogs/${id}/submit`);
  return data.blog;
}

export async function adminPublishBlog(id: string): Promise<Blog> {
  const { data } = await apiClient.post(`/blogs/${id}/publish`);
  return data.blog;
}

export async function adminRejectBlog(id: string): Promise<Blog> {
  const { data } = await apiClient.post(`/blogs/${id}/reject`);
  return data.blog;
}
