import md from '../../../static/privacy.md?raw';
import parseMarkdown from '../../utils/parseMarkdown';

export const load = () => ({ html: parseMarkdown(md) });
