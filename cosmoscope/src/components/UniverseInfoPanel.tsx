
interface UniverseInfoPanelProps {
  objectId: string | null;
  onClose: () => void;
}

const UNIVERSE_DATA: Record<string, {
  name: string;
  category: string;
  categoryColor: string;
  stats: { label: string; value: string }[];
  description: string;
  fact: string;
}> = {
  'bootes-void': {
    name: 'Boötes Void',
    category: 'Cosmic Void',
    categoryColor: '#4fc3f7',
    stats: [
      { label: 'Diameter', value: '~330 million light years' },
      { label: 'Distance', value: '700 million light years' },
      { label: 'Galaxies found', value: '~60 (expected: thousands)' },
      { label: 'Discovered', value: '1981 (Robert Kirshner et al.)' },
    ],
    description: `One of the largest known cosmic voids, a vast region of space containing almost no galaxies. The Boötes Void spans roughly 330 million light years across. When it was discovered in 1981, astronomers found only 60 galaxies where thousands were expected, leading some to nickname it "The Great Nothing."`,
    fact: `If the Milky Way sat at the centre of the Boötes Void, astronomers would probably not have known other galaxies existed until the 1960s.`,
  },
  'local-void': {
    name: 'Local Void',
    category: 'Cosmic Void',
    categoryColor: '#4fc3f7',
    stats: [
      { label: 'Diameter', value: '~150 million light years' },
      { label: 'Distance from Milky Way', value: 'Adjacent, we sit at its edge' },
      { label: 'Effect on us', value: 'Local Group drifts away from it' },
      { label: 'Discovered', value: '1987 (Tully & Fisher)' },
    ],
    description: `The cosmic void that our Local Group of galaxies sits on the boundary of. The Local Void spans roughly 150 million light years. Because it holds so little matter, the denser regions around it pull harder, and the Milky Way drifts away from the void at around 260 kilometres per second.`,
    fact: `Empty space cannot push. The Local Void seems to repel us only because the galaxies on every other side are pulling us towards them.`,
  },
  'eridanus-void': {
    name: 'Eridanus Supervoid',
    category: 'Cosmic Supervoid',
    categoryColor: '#9c27b0',
    stats: [
      { label: 'Diameter', value: 'Up to ~1.8 billion light years' },
      { label: 'Distance', value: '~3 billion light years' },
      { label: 'CMB temperature', value: '70 μK colder than surroundings' },
      { label: 'Proposed', value: '2007 (Rudnick et al.)' },
    ],
    description: `One of the largest known voids, possibly up to 1.8 billion light years across. The Eridanus Supervoid is associated with the CMB Cold Spot: a region of the cosmic microwave background radiation that is anomalously cold. Whether the void fully explains the Cold Spot remains one of cosmology's open questions.`,
    fact: `Some physicists have proposed that the Cold Spot associated with the Eridanus Supervoid might be evidence of a collision with another universe, though the supervoid itself is the more conventional explanation.`,
  },
  'sculptor-void': {
    name: 'Sculptor Void',
    category: 'Cosmic Void',
    categoryColor: '#4fc3f7',
    stats: [
      { label: 'Sky location', value: 'Constellation of Sculptor' },
      { label: 'Hemisphere', value: 'Southern sky' },
      { label: 'Found by', value: 'Galaxy redshift surveys' },
    ],
    description: `A large region of space with very few galaxies, lying in the direction of the constellation Sculptor in the southern sky. Voids like this one showed astronomers that galaxies are arranged in a vast web of walls and filaments around empty regions.`,
    fact: `Voids make up most of the volume of the universe, yet they contain only a small fraction of its galaxies.`,
  },
  'milky-way-u': {
    name: 'The Milky Way',
    category: 'Spiral Galaxy · Our Home',
    categoryColor: '#ffd54f',
    stats: [
      { label: 'Diameter', value: '~100,000 light years' },
      { label: 'Stars', value: '100–400 billion' },
      { label: 'Age', value: '~13.6 billion years' },
      { label: 'Type', value: 'Barred spiral galaxy' },
    ],
    description: `You are here. The Milky Way is a barred spiral galaxy containing between 100 and 400 billion stars, including our Sun. It is part of the Local Group of galaxies and sits on the edge of the Local Void. At its centre lies Sagittarius A*, a supermassive black hole 4 million times the mass of the Sun.`,
    fact: `The Milky Way and Andromeda are moving towards each other. A 2025 study found roughly even odds that they merge within the next 10 billion years. Even if they do, stars are so far apart that our Solar System would very likely survive.`,
  },
  'andromeda-u': {
    name: 'Andromeda Galaxy',
    category: 'Spiral Galaxy',
    categoryColor: '#4fc3f7',
    stats: [
      { label: 'Distance', value: '2.537 million light years' },
      { label: 'Diameter', value: '~220,000 light years' },
      { label: 'Stars', value: '~1 trillion' },
      { label: 'Chance of merger', value: 'About 50% in 10 billion years' },
    ],
    description: `The nearest large galaxy to the Milky Way and one of the most distant objects you can see with the naked eye. It is larger than our galaxy and holds around 1 trillion stars, perhaps two to four times as many as the Milky Way, though the two galaxies may be similar in total mass.`,
    fact: `On a clear dark night Andromeda is visible to the naked eye as a faint smudge. You are seeing light that left it 2.5 million years ago, around the time early humans were making some of the first stone tools.`,
  },
  'virgo-cluster': {
    name: 'Virgo Cluster',
    category: 'Galaxy Cluster',
    categoryColor: '#ffffff',
    stats: [
      { label: 'Distance', value: '54 million light years' },
      { label: 'Diameter', value: '~7 million light years' },
      { label: 'Member galaxies', value: '~1,300 confirmed' },
      { label: 'Central galaxy', value: 'M87 (host of M87*)' },
    ],
    description: `The nearest large galaxy cluster and the gravitational centre of the Virgo Supercluster, the larger structure our Local Group belongs to. The giant elliptical galaxy M87 at its centre hosts the first black hole ever imaged by humanity: M87*, photographed by the Event Horizon Telescope in 2019.`,
    fact: `The Virgo Cluster is so massive that it slows the expansion of the universe around it. Galaxies near it move away from us more slowly than Hubble's Law would predict.`,
  },
  'coma-cluster': {
    name: 'Coma Cluster',
    category: 'Galaxy Cluster',
    categoryColor: '#ffcc88',
    stats: [
      { label: 'Distance', value: '320 million light years' },
      { label: 'Member galaxies', value: '1,000+' },
      { label: 'Diameter', value: '~20 million light years' },
      { label: 'Dark matter', value: '~90% of total mass' },
    ],
    description: `One of the densest known galaxy clusters. The Coma Cluster was the first place where astronomers found evidence for dark matter. Fritz Zwicky noticed in 1933 that the galaxies were moving far too fast to be held together by visible matter alone. Something invisible had to be providing the extra gravity.`,
    fact: `Fritz Zwicky's 1933 dark matter discovery in the Coma Cluster was ignored for 40 years. He called the missing mass "dunkle Materie", dark matter. He was right.`,
  },
  'perseus-cluster': {
    name: 'Perseus Cluster',
    category: 'Galaxy Cluster',
    categoryColor: '#ffffff',
    stats: [
      { label: 'Distance', value: '240 million light years' },
      { label: 'Member galaxies', value: 'Thousands' },
      { label: 'X-ray luminosity', value: 'Brightest X-ray cluster' },
      { label: 'Sound wave period', value: '10 million years' },
    ],
    description: `One of the most massive objects in the known universe, containing thousands of galaxies immersed in a vast cloud of multimillion-degree gas. In 2003, NASA's Chandra X-ray Observatory detected pressure waves in the Perseus Cluster — sound waves with a frequency 57 octaves below middle C, caused by the central black hole.`,
    fact: `The Perseus Cluster holds sound waves with a period of about 10 million years, the deepest note ever detected. It sits 57 octaves below middle C.`,
  },
  'great-attractor': {
    name: 'The Great Attractor',
    category: 'Gravitational Anomaly',
    categoryColor: '#9c27b0',
    stats: [
      { label: 'Distance', value: '650 million light years' },
      { label: 'Mass', value: 'Thousands of Milky Ways' },
      { label: 'Pulling us at', value: '~600 km/s' },
      { label: 'Visibility', value: 'Hidden behind Milky Way plane' },
    ],
    description: `An immense concentration of mass that helps pull the Milky Way, Andromeda and thousands of other galaxies towards it. Our galaxy moves at about 600 kilometres per second relative to the cosmic background, and the Great Attractor is part of the reason. It is hard to see because it lies behind the dense disc of our own galaxy, in the "Zone of Avoidance".`,
    fact: `Despite its pull, we will never reach the Great Attractor. The expansion of the universe carries it away from us faster than we fall towards it.`,
  },
};

export default function UniverseInfoPanel({ objectId, onClose }: UniverseInfoPanelProps) {
  if (!objectId) return null;

  const data = UNIVERSE_DATA[objectId];
  if (!data) return null;

  return (
    <>
      <div className="fixed inset-0 z-[39]" onClick={onClose} />
      <div
        className="fixed right-4 z-40 flex flex-col"
        style={{
          top: '220px',
          width: 360,
          maxWidth: 'calc(100vw - 2rem)',
          maxHeight: '85vh',
          background: 'rgba(10,10,26,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(79,195,247,0.2)',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'rgba(10,10,26,0.97)',
            borderBottom: '1px solid rgba(79,195,247,0.08)',
            padding: '20px 20px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              color: data.categoryColor,
              margin: 0,
              letterSpacing: '0.06em',
              lineHeight: 1.3,
            }}>
              {data.name}
            </h2>
            <span style={{
              display: 'inline-block',
              marginTop: 6,
              padding: '2px 10px',
              background: 'rgba(79,195,247,0.08)',
              border: '1px solid rgba(79,195,247,0.2)',
              borderRadius: 20,
              color: 'rgba(255,255,255,0.55)',
              fontSize: 10,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}>
              {data.category.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '16px 20px 24px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px 12px',
              marginBottom: 20,
            }}
          >
            {data.stats.map((s) => (
              <div
                key={s.label}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}
              >
                <div style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.35)',
                  marginBottom: 3,
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.06em',
                }}>
                  {s.label.toUpperCase()}
                </div>
                <div style={{
                  fontSize: 12,
                  color: '#e0e0e0',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 20,
            fontFamily: 'Inter, sans-serif',
          }}>
            {data.description}
          </p>

          <div style={{
            padding: '14px 16px',
            background: 'rgba(255,213,79,0.04)',
            border: '1px solid rgba(255,213,79,0.15)',
            borderRadius: 10,
            marginBottom: 20,
          }}>
            <div style={{
              fontSize: 10,
              color: '#ffd54f',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 8,
            }}>
              ✦ FASCINATING FACT
            </div>
            <p style={{
              fontSize: 12,
              lineHeight: 1.7,
              color: 'rgba(255,213,79,0.8)',
              margin: 0,
              fontFamily: 'Inter, sans-serif',
            }}>
              {data.fact}
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
