
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            // Ensure imports to the local answer-corrector package resolve to its source
            '@librelingo/answer-corrector': path.resolve(__dirname, '../answer-corrector'),
            // Alias to the web app's JSON course folder
            'courses': path.resolve(__dirname, './src/courses')
        }
    },
    css: {
        preprocessorOptions: {
            sass: {
                quietDeps: true,
                silenceDeprecations: ['legacy-js-api'],
                api: 'modern-compiler' // or 'modern'
            },
            scss: {
                api: 'modern-compiler', // or 'modern'
                quietDeps: true,
                silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin']
            }
        }
    },
    plugins: [sveltekit(), mdPlugin({ mode: [Mode.MARKDOWN, Mode.HTML] })],
    server: {
        fs: {
            allow: [
                // Allow access to sibling workspace packages like answer-corrector
                '../answer-corrector',
                '../../courses',
                'config'
            ]
        },
        allowedHosts: ['lingo.example.com'] // Change this line
    }
});