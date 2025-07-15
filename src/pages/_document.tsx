import nextI18nextConfig from 'next-i18next.config'
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentProps,
} from 'next/document'

type Props = DocumentProps & {
  // add custom document props
}

class MyDocument extends Document<Props> {
  render() {
    const currentLocale = this.props.__NEXT_DATA__.locale ?? nextI18nextConfig.i18n.defaultLocale
    
    return (
      <Html data-bs-theme="light" lang={currentLocale}>
        <Head>
          {/* The actual theme stylesheet will be injected by ThemeProvider */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const theme = localStorage.getItem('mmdl-theme');
                    if (theme && theme !== 'default') {
                      const link = document.createElement('link');
                      link.id = 'bootswatch-theme';
                      link.rel = 'stylesheet';
                      link.href = 'https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/' + theme + '/bootstrap.min.css';
                      document.head.appendChild(link);
                    }
                  } catch (e) {
                    console.error('Error applying theme:', e);
                  }
                })();
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument