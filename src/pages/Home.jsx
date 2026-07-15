import RotatingText from '../components/RotatingText/RotatingText';
import './Home.css';

const SKILLS_LIST = [
  'Linux administration',
  'Docker containerization',
  'AI agent building',
  'agent skill writing',
  'Linux systems management',
  'container deployment',
  'agent development',
  'tool integration',
];

const ROTATING_TEXT_TRANSITION = { type: 'spring', damping: 30, stiffness: 400 };
const ROTATION_INTERVAL_MS = 2000;
const STAGGER_DURATION_SECONDS = 0.025;

function Home() {
  return (
    <main className="content typeset typeset-docs home-container">
      <div className="home-hero-header">
        <p className="home-hero-subtitle">I am</p>
        <h1 className="home-hero-title-primary">IVASCU</h1>
        <h1 className="home-hero-title-secondary">ANDREI BOGDAN</h1>
      </div>

      <p className="home-skills-intro">I am good at</p>
      <p className="home-skills-rotating">
        <RotatingText
          texts={SKILLS_LIST}
          mainClassName=""
          staggerFrom="last"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-120%' }}
          splitLevelClassName="rotate-word-wrap"
          staggerDuration={STAGGER_DURATION_SECONDS}
          transition={ROTATING_TEXT_TRANSITION}
          rotationInterval={ROTATION_INTERVAL_MS}
          splitBy="words"
        />
      </p>

      <p className="home-paragraph">
        This is a placeholder text to demonstrate scrolling functionality. The navigation bar at the top features a smooth, animated highlight that follows your cursor with precise movements and subtle interactions.
      </p>

      <h2 className="home-section-title">Section One</h2>
      <p className="home-paragraph">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <p className="home-paragraph">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit animi id est laborum.
      </p>
      <p className="home-paragraph">
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
      </p>

      <h2 className="home-section-title">Section Two</h2>
      <p className="home-paragraph">
        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
      </p>
      <p className="home-paragraph">
        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
      </p>
      <p className="home-paragraph">
        Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
      </p>

      <h2 className="home-section-title">Section Three</h2>
      <p className="home-paragraph">
        Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
      </p>
      <p className="home-paragraph">
        Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.
      </p>
      <p className="home-paragraph">
        Ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.
      </p>

      <h2 className="home-section-title">Section Four</h2>
      <p className="home-paragraph">
        Vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
      </p>
      <p className="home-paragraph">
        Excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
      </p>
      <p className="home-paragraph">
        Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.
      </p>
    </main>
  );
}

export default Home;
