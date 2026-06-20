const { Client } = require('@notionhq/client');
require('dotenv').config({ path: '.env.local' });
const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function test() {
  const dbId = process.env.NOTION_DATABASE_ID;
  const pages = await notion.databases.query({
    database_id: dbId,
    sorts: [{ timestamp: "created_time", direction: "descending" }]
  });
  if (pages.results.length === 0) return console.log("No pages");
  
  const pageId = pages.results[0].id;
  console.log("Latest page ID:", pageId);
  const blocks = await notion.blocks.children.list({ block_id: pageId });
  
  let currentStep = null;
  let step10Content = "";
  for (const block of blocks.results) {
    if (block.type === "heading_2") {
      const text = block.heading_2.rich_text.map(t => t.plain_text).join("");
      console.log("Heading:", text);
      if (text.includes("Step 10") || text.includes("Step10")) {
        currentStep = "step10";
      } else {
        currentStep = null;
      }
    } else if (currentStep === "step10") {
      let content = "";
      if (block.type === "quote") content = block.quote.rich_text.map(t => t.plain_text).join("");
      else if (block.type === "paragraph") content = block.paragraph.rich_text.map(t => t.plain_text).join("");
      if (content) {
         step10Content += content + "\n";
      }
    }
  }
  console.log("Step 10 content length:", step10Content.length);
  console.log("Step 10 content preview:\n", step10Content.substring(0, 500));
}
test();
