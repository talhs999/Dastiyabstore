# Deployment and Prisma Rules

- **Deployment Workflow**: After completing features or tasks that require deployment to Hostinger, ALWAYS push the code to GitHub (`git add .`, `git commit -m "..."`, `git push`). Hostinger will automatically deploy from the GitHub repository.
- **Database Migrations**: When Prisma schema changes are made, ALWAYS run `npx prisma db push` against the live/target database to ensure the schema is updated before deployment.
- **Environment**: Keep in mind that Hostinger requires code changes to be pushed to GitHub for deployment.
- **CRITICAL**: NEVER execute the deployment workflow, run `prisma db push`, or make github pushes automatically. You MUST always wait for the user's explicit instruction and permission before doing any of these actions.
