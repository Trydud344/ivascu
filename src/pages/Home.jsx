import GradualBlur from '../components/GradualBlur/GradualBlur';
import RotatingText from '../components/RotatingText/RotatingText';

function Home() {
  return (
    <>
      <main className="content typeset typeset-docs" style={{ maxWidth: 960, margin: '0 auto', padding: '60px 0 100px', position: 'relative' }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 24, fontWeight: 400, color: '#999', letterSpacing: '.15em', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
            I am
          </p>
          <h1 style={{ fontSize: 72, fontWeight: 800, margin: 0, lineHeight: 0.9, letterSpacing: '-.04em', color: '#fff' }}>
            IVASCU
          </h1>
          <h1 style={{ fontSize: 52, fontWeight: 300, margin: '8px 0 0 0', lineHeight: 1, letterSpacing: '-.02em', background: 'linear-gradient(135deg, #aaa, #444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ANDREI BOGDAN
          </h1>
        </div>
        <p style={{ fontSize: 36, fontWeight: 300, color: '#666', marginBottom: 6, letterSpacing: '-.02em', lineHeight: 1.1 }}>
          I am good at
        </p>
        <p style={{ fontSize: 36, fontWeight: 300, color: '#666', marginBottom: 48, letterSpacing: '-.02em', lineHeight: 1.1 }}>
          <RotatingText
            texts={[
              'Linux administration',
              'Docker containerization',
              'AI agent building',
              'agent skill writing',
              'Linux systems management',
              'container deployment',
              'agent development',
              'tool integration',
            ]}
            mainClassName=""
            staggerFrom="last"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-120%' }}
            splitLevelClassName="rotate-word-wrap"
            staggerDuration={0.025}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            rotationInterval={2000}
            splitBy="words"
          />
        </p>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          This is a placeholder text to demonstrate scrolling functionality. The navigation bar at the top features a smooth, animated highlight that follows your cursor with precise movements and subtle interactions.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 500, color: '#e0e0e0', marginTop: 48, marginBottom: 16, letterSpacing: '-.01em' }}>
          Section One
        </h2>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit animi id est laborum.
        </p>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 500, color: '#e0e0e0', marginTop: 48, marginBottom: 16, letterSpacing: '-.01em' }}>
          Section Two
        </h2>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
        </p>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
        </p>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 500, color: '#e0e0e0', marginTop: 48, marginBottom: 16, letterSpacing: '-.01em' }}>
          Section Three
        </h2>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
        </p>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.
        </p>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          Ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 500, color: '#e0e0e0', marginTop: 48, marginBottom: 16, letterSpacing: '-.01em' }}>
          Section Four
        </h2>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          Vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
        </p>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          Excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
        </p>
        <p style={{ marginBottom: 16, letterSpacing: '-.005em' }}>
          Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.
        </p>
      </main>

      <GradualBlur
        target="page"
        position="top"
        height="6rem"
        strength={3}
        divCount={8}
        curve="bezier"
        exponential={true}
        opacity={1}
        zIndex={-1}
      />
    </>
  );
}

export default Home;
