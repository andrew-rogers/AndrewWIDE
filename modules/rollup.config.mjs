export default {
	input: 'modules.mjs',
  external: ['plotly', 'mathjax', 'marked'],
	output: {
		file: '../www/modules.js',
		format: 'umd',
		name: 'AndrewWIDE.modules',
    paths: {
			plotly: 'https://cdn.plot.ly/plotly-2.12.1.min.js',
      mathjax: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-AMS-MML_SVG',
      marked: 'https://cdn.jsdelivr.net/gh/markedjs/marked/marked.min.js'
		},
    globals: {
			plotly: 'plotly',
      mathjax: 'MathJax',
      marked: 'marked'
		}
	}
};

