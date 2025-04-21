import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title="Welcome"
      description="Modular containers and tooling for structured Node.js applications."
    >
      <main className={styles.hero}>
        <div className={styles.backgroundImage} />

        <div className={styles.content}>
          <h1 className={styles.title}>{siteConfig.title}</h1>
          <p className={styles.subtitle}>
            {siteConfig.tagline}
          </p>
          <div className={styles.buttons}>
            <Link className={styles.primaryButton} to="/docs/kernel/welcome/intro">
              Get Started
            </Link>
            <Link className={styles.secondaryButton} to="https://github.com/avanzu/node-packages">
              GitHub Repo
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}