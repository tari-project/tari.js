import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import { Zap, Cpu, Code } from 'react-feather';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Simple Integration with Tari L2',
    Svg: Zap,
    description: (
      <>
        Easily integrate with Tari's Layer 2 wallet and blockchain functionality using our simple and intuitive JavaScript/TypeScript libraries.
      </>
    ),
  },
  {
    title: 'Build Secure and Scalable dApps',
    Svg: Cpu,
    description: (
      <>
        Use Tari's advanced protocol to create decentralized applications with enhanced security and scalability for real-world use cases.
      </>
    ),
  },
  {
    title: 'Developer-Friendly Smart Contracts',
    Svg: Code,
    description: (
      <>
        Quickly deploy and manage Tari-based smart contracts with pre-built templates, a seamless transaction builder, and a robust API.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
