import md from '../../../static/imprint.md?raw';
import parseMarkdown from '../../utils/parseMarkdown';

export const load = () => ({ html: parseMarkdown(md) });
