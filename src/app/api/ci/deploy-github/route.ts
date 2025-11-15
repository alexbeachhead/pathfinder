import { NextRequest, NextResponse } from 'next/server';
import {
  generateGitHubActionsWorkflow,
  generatePlaywrightConfig,
  generateCIReadme,
  GitHubActionsConfig,
} from '@/lib/ci/githubActionsTemplate';

export const maxDuration = 60;

interface DeployGitHubRequest {
  token: string;
  repo: string; // Format: owner/repo
  config: GitHubActionsConfig;
  generatedCode: string;
}

/**
 * Deploy CI/CD pipeline to GitHub repository using GitHub API
 */
export async function POST(request: NextRequest) {
  try {
    const body: DeployGitHubRequest = await request.json();
    const { token, repo, config, generatedCode } = body;

    if (!token || !repo || !config || !generatedCode) {
      return NextResponse.json(
        { error: 'Missing required fields: token, repo, config, generatedCode' },
        { status: 400 }
      );
    }

    // Validate repo format
    const repoMatch = repo.match(/^([^/]+)\/([^/]+)$/);
    if (!repoMatch) {
      return NextResponse.json(
        { error: 'Invalid repository format. Expected: owner/repo' },
        { status: 400 }
      );
    }

    const [, owner, repoName] = repoMatch;

    // Generate all files
    const workflowName = config.testSuiteName.toLowerCase().replace(/\s+/g, '-');
    const extension = config.codeLanguage === 'typescript' ? 'ts' : 'js';

    const files = [
      {
        path: `.github/workflows/${workflowName}.yml`,
        content: generateGitHubActionsWorkflow(config),
      },
      {
        path: `playwright.config.${extension}`,
        content: generatePlaywrightConfig(config),
      },
      {
        path: `tests/test.spec.${extension}`,
        content: generatedCode,
      },
      {
        path: 'CI_PIPELINE_README.md',
        content: generateCIReadme(config),
      },
    ];

    // Get default branch
    const repoInfoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!repoInfoResponse.ok) {
      const errorData = await repoInfoResponse.json();
      return NextResponse.json(
        { error: `Failed to fetch repository info: ${errorData.message}` },
        { status: repoInfoResponse.status }
      );
    }

    const repoInfo = await repoInfoResponse.json();
    const defaultBranch = repoInfo.default_branch || 'main';

    // Get the latest commit SHA for the default branch
    const refResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${defaultBranch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!refResponse.ok) {
      const errorData = await refResponse.json();
      return NextResponse.json(
        { error: `Failed to get branch reference: ${errorData.message}` },
        { status: refResponse.status }
      );
    }

    const refData = await refResponse.json();
    const latestCommitSha = refData.object.sha;

    // Create blobs for each file
    const blobs = await Promise.all(
      files.map(async (file) => {
        const blobResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/blobs`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: file.content,
            encoding: 'utf-8',
          }),
        });

        if (!blobResponse.ok) {
          throw new Error(`Failed to create blob for ${file.path}`);
        }

        const blobData = await blobResponse.json();
        return {
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha,
        };
      })
    );

    // Get base tree
    const baseTreeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/git/trees/${latestCommitSha}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!baseTreeResponse.ok) {
      const errorData = await baseTreeResponse.json();
      return NextResponse.json(
        { error: `Failed to get base tree: ${errorData.message}` },
        { status: baseTreeResponse.status }
      );
    }

    const baseTree = await baseTreeResponse.json();

    // Create new tree
    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base_tree: baseTree.sha,
        tree: blobs,
      }),
    });

    if (!treeResponse.ok) {
      const errorData = await treeResponse.json();
      return NextResponse.json(
        { error: `Failed to create tree: ${errorData.message}` },
        { status: treeResponse.status }
      );
    }

    const treeData = await treeResponse.json();

    // Create commit
    const commitResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add Playwright CI/CD pipeline for ${config.testSuiteName}\n\nGenerated by Pathfinder - Intelligent Automated Testing Platform`,
        tree: treeData.sha,
        parents: [latestCommitSha],
      }),
    });

    if (!commitResponse.ok) {
      const errorData = await commitResponse.json();
      return NextResponse.json(
        { error: `Failed to create commit: ${errorData.message}` },
        { status: commitResponse.status }
      );
    }

    const commitData = await commitResponse.json();

    // Update reference to point to new commit
    const updateRefResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${defaultBranch}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sha: commitData.sha,
          force: false,
        }),
      }
    );

    if (!updateRefResponse.ok) {
      const errorData = await updateRefResponse.json();
      return NextResponse.json(
        { error: `Failed to update reference: ${errorData.message}` },
        { status: updateRefResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'CI/CD pipeline deployed successfully',
      data: {
        commitSha: commitData.sha,
        commitUrl: commitData.html_url,
        branch: defaultBranch,
        files: files.map((f) => f.path),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to deploy to GitHub' },
      { status: 500 }
    );
  }
}
