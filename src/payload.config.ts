import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { ru } from "@payloadcms/translations/languages/ru";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Listings } from "./collections/Listings";
import { Leads } from "./collections/Leads";
import { Tasks } from "./collections/Tasks";
import { ResidentialComplexes } from "./collections/ResidentialComplexes";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterNavLinks: ["@/components/admin/KanbanNavLink#KanbanNavLink"],
      views: {
        leadsKanban: {
          Component: "@/components/admin/KanbanView#KanbanView",
          path: "/leads-kanban",
        },
      },
    },
  },
  routes: {
    admin: "/staff-x7k2",
  },
  i18n: {
    supportedLanguages: { ru, en },
    fallbackLanguage: "ru",
  },
  collections: [Users, Media, Listings, Leads, Tasks, ResidentialComplexes],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
      ssl: { rejectUnauthorized: false },
    },
  }),
  sharp,
});
