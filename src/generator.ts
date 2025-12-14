/**
 * Generator for LikeC4 DSL from typed input.
 *
 * Transforms typed TypeScript objects into LikeC4 DSL strings.
 */

import type { Model } from './schema/model.js';
import type { Actor } from './schema/actor.js';
import type { System } from './schema/system.js';
import type { Container } from './schema/container.js';
import type { Component } from './schema/component.js';
import type {
  SystemRelationship,
  ContainerRelationship,
  ComponentRelationship,
} from './schema/relationship.js';
import { ModelSchema } from './schema/model.js';
import { validateConstraints } from './constraints/index.js';

/**
 * Indentation helper.
 */
function indent(level: number): string {
  return '  '.repeat(level);
}

/**
 * Generates tag syntax.
 */
function generateTag(tag: string): string {
  return `#${tag}`;
}

/**
 * Generates metadata syntax.
 */
function generateMetadata(metadata: Record<string, string>, level: number): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(metadata)) {
    lines.push(`${indent(level)}${key}: '${value}'`);
  }
  return lines.join('\n');
}

/**
 * Generates link syntax.
 */
function generateLink(
  url: string,
  type: string,
  level: number
): string {
  return `${indent(level)}link '${url}' {
${indent(level + 1)}${type}
${indent(level)}}`;
}

/**
 * Generates relationship syntax.
 */
function generateRelationship(
  rel: SystemRelationship | ContainerRelationship | ComponentRelationship,
  level: number
): string {
  const asyncTag = 'is_async' in rel && rel.is_async ? ' #async' : '';
  return `${indent(level)}-> ${rel.to_id} '${rel.label}' {
${indent(level + 1)}technology: '${rel.technology}'${asyncTag}
${indent(level)}}`;
}

/**
 * Generates component DSL.
 */
function generateComponent(component: Component, level: number): string {
  const lines: string[] = [];
  const tags = component.tags?.map(generateTag).join(' ') || '';

  lines.push(
    `${indent(level)}${component.id} = component '${component.title}' ${tags} {`
  );
  lines.push(`${indent(level + 1)}description '${component.description}'`);
  lines.push(`${indent(level + 1)}technology '${component.technology}'`);

  // Metadata
  if (component.metadata) {
    lines.push('');
    lines.push(generateMetadata(component.metadata, level + 1));
  }

  // Links
  if (component.links) {
    lines.push('');
    for (const link of component.links) {
      lines.push(generateLink(link.url, link.type, level + 1));
    }
  }

  // Relationships
  if (component.relationships && component.relationships.length > 0) {
    lines.push('');
    for (const rel of component.relationships) {
      lines.push(generateRelationship(rel, level + 1));
    }
  }

  lines.push(`${indent(level)}}`);
  return lines.join('\n');
}

/**
 * Generates container DSL.
 */
function generateContainer(
  container: Container,
  level: number
): string {
  const lines: string[] = [];
  const tags = container.tags?.map(generateTag).join(' ') || '';

  lines.push(
    `${indent(level)}${container.id} = container '${container.title}' ${tags} {`
  );
  lines.push(`${indent(level + 1)}description '${container.description}'`);
  lines.push(`${indent(level + 1)}technology '${container.technology}'`);

  // Shape
  if (container.shape) {
    lines.push(`${indent(level + 1)}shape: ${container.shape}`);
  }

  // Git URL (repository link)
  lines.push('');
  lines.push(`${indent(level + 1)}link '${container.git_url}' {`);
  lines.push(`${indent(level + 2)}repository`);
  lines.push(`${indent(level + 1)}}`);

  // Additional links
  if (container.links) {
    for (const link of container.links) {
      lines.push(generateLink(link.url, link.type, level + 1));
    }
  }

  // Metadata
  if (container.metadata) {
    lines.push('');
    lines.push(generateMetadata(container.metadata, level + 1));
  }

  // Relationships
  if (container.relationships && container.relationships.length > 0) {
    lines.push('');
    for (const rel of container.relationships) {
      lines.push(generateRelationship(rel, level + 1));
    }
  }

  // Components
  if (container.components && container.components.length > 0) {
    lines.push('');
    for (const component of container.components) {
      lines.push(generateComponent(component, level + 1));
      lines.push('');
    }
  }

  lines.push(`${indent(level)}}`);
  return lines.join('\n');
}

/**
 * Generates system DSL.
 */
function generateSystem(system: System, level: number): string {
  const lines: string[] = [];
  const tags = system.tags?.map(generateTag).join(' ') || '';

  lines.push(
    `${indent(level)}${system.id} = system '${system.title}' ${tags} {`
  );
  lines.push(`${indent(level + 1)}description '${system.description}'`);

  // Links
  if (system.links && system.links.length > 0) {
    lines.push('');
    for (const link of system.links) {
      lines.push(generateLink(link.url, link.type, level + 1));
    }
  }

  // Metadata
  if (system.metadata) {
    lines.push('');
    lines.push(generateMetadata(system.metadata, level + 1));
  }

  // Relationships
  if (system.relationships && system.relationships.length > 0) {
    lines.push('');
    for (const rel of system.relationships) {
      lines.push(generateRelationship(rel, level + 1));
    }
  }

  // Containers
  if (system.containers && system.containers.length > 0) {
    lines.push('');
    for (const container of system.containers) {
      lines.push(generateContainer(container, level + 1));
      lines.push('');
    }
  }

  lines.push(`${indent(level)}}`);
  return lines.join('\n');
}

/**
 * Generates actor DSL.
 */
function generateActor(actor: Actor, level: number): string {
  const lines: string[] = [];
  const tag = actor.tag ? generateTag(actor.tag) : '';

  lines.push(`${indent(level)}${actor.id} = actor '${actor.title}' ${tag} {`);
  lines.push(`${indent(level + 1)}description '${actor.description}'`);

  // Slack channel for teams
  if (actor.tag === 'team' && actor.slack_channel) {
    lines.push('');
    lines.push(`${indent(level + 1)}slack_channel: '${actor.slack_channel}'`);
  }

  // Ownership relationships
  if (actor.owns && actor.owns.length > 0) {
    lines.push('');
    for (const systemId of actor.owns) {
      lines.push(`${indent(level + 1)}.owns ${systemId}`);
    }
  }

  lines.push(`${indent(level)}}`);
  return lines.join('\n');
}

/**
 * Generates specification header.
 */
function generateSpecification(): string {
  return `specification {
  element actor
  element system
  element container
  element component

  tag customer
  tag internal
  tag vendor
  tag bot
  tag team

  tag external
  tag deprecated
  tag planned
  tag critical
  tag async
}`;
}

/**
 * Generates complete LikeC4 DSL from a model.
 *
 * @param model - The model to generate DSL from
 * @returns LikeC4 DSL string
 * @throws Error if model is invalid
 */
export function generate(model: Model): string {
  // Validate input schema
  const parseResult = ModelSchema.safeParse(model);
  if (!parseResult.success) {
    throw new Error(
      `Schema validation failed: ${JSON.stringify(parseResult.error.errors, null, 2)}`
    );
  }

  // Validate constraints
  const violations = validateConstraints(model);
  if (violations.length > 0) {
    throw new Error(
      `Constraint validation failed:\n${violations.map((v) => `  ${v.path}: ${v.message}`).join('\n')}`
    );
  }

  const lines: string[] = [];

  // Specification
  lines.push(generateSpecification());
  lines.push('');

  // Actors
  if (model.actors.length > 0) {
    lines.push('// Actors');
    for (const actor of model.actors) {
      lines.push(generateActor(actor, 0));
      lines.push('');
    }
  }

  // Systems
  if (model.systems.length > 0) {
    lines.push('// Systems');
    for (const system of model.systems) {
      lines.push(generateSystem(system, 0));
      lines.push('');
    }
  }

  return lines.join('\n');
}
