/**
 * Example model demonstrating thatssoc4 usage.
 */

import { Model } from '../src/schema/model.js';

export const exampleModel: Model = {
  actors: [
    {
      id: 'platformTeam',
      title: 'Platform Team',
      description: 'Core infrastructure and platform team',
      tag: 'team',
      slack_channel: '#platform-eng',
      owns: ['backend'],
    },
    {
      id: 'frontendTeam',
      title: 'Frontend Team',
      description: 'Frontend development team',
      tag: 'team',
      slack_channel: '#frontend-eng',
      owns: ['frontend'],
    },
    {
      id: 'customer',
      title: 'Customer',
      description: 'End user of the platform',
      tag: 'customer',
    },
  ],

  systems: [
    {
      id: 'frontend',
      title: 'Frontend Application',
      description: 'Web application for users',
      tags: ['critical'],
      links: [
        {
          url: 'https://wiki.example.com/frontend',
          type: 'wiki',
        },
      ],
      relationships: [
        {
          to_id: 'backend',
          label: 'fetches data from',
          technology: 'GraphQL',
        },
      ],
      containers: [
        {
          id: 'webApp',
          title: 'Web Application',
          description: 'React-based web application',
          technology: 'React',
          git_url: 'https://github.com/example/web-app',
          shape: 'browser',
          links: [
            {
              url: 'https://ci.example.com/web-app',
              type: 'ci_pipeline',
            },
          ],
        },
      ],
    },

    {
      id: 'backend',
      title: 'Backend Services',
      description: 'Core backend services',
      tags: ['critical'],
      containers: [
        {
          id: 'apiGateway',
          title: 'API Gateway',
          description: 'GraphQL API gateway',
          technology: 'Apollo Server',
          git_url: 'https://github.com/example/api-gateway',
          relationships: [
            {
              to_id: 'userService',
              label: 'routes requests to',
              technology: 'HTTP',
            },
          ],
        },
        {
          id: 'userService',
          title: 'User Service',
          description: 'User management service',
          technology: 'Node.js',
          git_url: 'https://github.com/example/user-service',
          relationships: [
            {
              to_id: 'database',
              label: 'stores data in',
              technology: 'PostgreSQL',
            },
          ],
          components: [
            {
              id: 'authModule',
              title: 'Authentication Module',
              description: 'Handles user authentication',
              technology: 'Passport.js',
              relationships: [
                {
                  to_id: 'userRepository',
                  label: 'uses',
                  technology: 'in-process',
                },
              ],
            },
            {
              id: 'userRepository',
              title: 'User Repository',
              description: 'Data access for users',
              technology: 'TypeORM',
            },
          ],
        },
        {
          id: 'database',
          title: 'Database',
          description: 'Primary database',
          technology: 'PostgreSQL',
          git_url: 'https://github.com/example/db-migrations',
          shape: 'storage',
        },
      ],
    },
  ],
};
