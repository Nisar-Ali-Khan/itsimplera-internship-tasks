import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ImagePlus } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import FormField from '../components/FormField';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';
import Loader from '../components/Loader';
import * as postService from '../services/postService';
import { validatePostForm, getErrorMessage } from '../utils/validators';
import { resolveMediaUrl } from '../utils/media';

const initialForm = { title: '', content: '', category: 'General', tags: [], status: 'draft' };

const CreateEditPost = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [postId, setPostId] = useState(id);

  useEffect(() => {
    if (!isEditMode) return;
    postService
      .getPostById(id)
      .then(({ post }) => {
        setForm({
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags || [],
          status: post.status,
        });
        setCoverPreview(post.coverImageUrl ? resolveMediaUrl(post.coverImageUrl) : '');
        setPostId(post._id);
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
        navigate('/my-posts');
      })
      .finally(() => setLoading(false));
  }, [id, isEditMode, navigate]);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const savePost = async (statusOverride) => {
    const payload = { ...form, status: statusOverride || form.status };
    const validationErrors = validatePostForm(payload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setSubmitting(true);
    try {
      let savedPost;
      if (isEditMode) {
        const res = await postService.updatePost(postId, payload);
        savedPost = res.post;
      } else {
        const res = await postService.createPost(payload);
        savedPost = res.post;
      }

      if (coverFile) {
        await postService.uploadCoverImage(savedPost._id, coverFile);
      }

      toast.success(isEditMode ? 'Post updated' : statusOverride === 'published' ? 'Post published' : 'Draft saved');
      navigate(`/posts/${savedPost.slug || savedPost._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Loader />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <h1 className="font-display font-semibold text-2xl mb-1">{isEditMode ? 'Edit Post' : 'Write a New Post'}</h1>
      <p className="text-sm text-inkmuted mb-6">
        {isEditMode ? 'Update your post below.' : 'Save as a draft, or publish it right away.'}
      </p>

      <div className="space-y-5">
        <FormField label="Cover Image">
          <label className="block cursor-pointer">
            <div className="aspect-[16/9] rounded-lg border-2 border-dashed border-ink/20 bg-paper flex items-center justify-center overflow-hidden hover:border-forest-500 transition-colors">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-inkmuted">
                  <ImagePlus size={24} />
                  <span className="text-sm">Click to upload a cover image</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
          </label>
        </FormField>

        <FormField label="Title" htmlFor="title" error={errors.title}>
          <input
            id="title"
            type="text"
            className="input-field text-lg font-display"
            placeholder="Give your post a compelling title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category" htmlFor="category">
            <input
              id="category"
              type="text"
              className="input-field"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </FormField>
          <FormField label="Tags">
            <TagInput tags={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
          </FormField>
        </div>

        <FormField label="Content" error={errors.content}>
          <RichTextEditor
            value={form.content}
            onChange={(content) => setForm({ ...form, content })}
            placeholder="Tell your story…"
          />
        </FormField>

        <div className="flex gap-3 pt-2">
          <button onClick={() => savePost('draft')} className="btn-secondary flex-1" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save as Draft'}
          </button>
          <button onClick={() => savePost('published')} className="btn-primary flex-1" disabled={submitting}>
            {submitting ? 'Publishing…' : 'Publish'}
          </button>
          <button onClick={() => navigate(-1)} className="btn-secondary" type="button">
            Cancel
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateEditPost;
