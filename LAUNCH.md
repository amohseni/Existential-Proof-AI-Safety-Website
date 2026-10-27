# Launch pass

The goal is a site we can share widely. It should list everything we have done, and every sentence should read as written by one of us. Work through the passes in order. Passes 1 and 2 can run in parallel.

## Taxonomy

The site holds four kinds of content. Each kind needs a different kind of work.

| Kind | Where it lives | Work it needs | Who should do it |
|---|---|---|---|
| A. Framing | Home hero and lede, About, Research intro and area texts, Work with us | Rewrite in our own voice; both of us must agree | One drafts, the other edits |
| B. Program pages | `adaptations`, `naturalizing-agency`, `measuring-attitudes`, `value-uncertainty`, `delegation` | Rewrite, and add missing current work | Whoever knows the work best drafts |
| C. Records | Publications, Talks, People (bios, students, collaborators) | Check facts and fill gaps; no voice work | Each person handles their own items |
| D. Site-wide | Titles, descriptions, link-preview card, footer, 404, links, analytics | Technical checks | Claude, on request |

Text that appears in two places has one source, and both copies change together:
- Key questions appear on `research.html` and `work-with-us.html`.
- Each program's summary appears on `index.html`, `research.html`, and its own program page.

## Pass 1: inventory (records)

1. Each of us puts our CV, as a PDF or text, in a shared place.
2. Claude compares each CV with Publications, Talks, and People, and lists every paper, talk, student, and collaborator that is missing or wrong.
3. Each of us confirms our own items. Then the entries go in, with every available version linked (journal, arXiv, PhilPapers).

## Pass 2: voice (framing and program pages)

To claim a page, put your initials in the Owner column below and push. One page per commit.

Write each page fresh in one sitting, from your own sense of the work. Do not edit the current text line by line. Edited model text keeps the model's sentence structure even after every word has changed.

A page passes when:
- It contains something only we would know: a specific result, a number, an example, or why we started the project.
- It makes claims a colleague could disagree with, in the first person plural.
- It reads well aloud.
- It avoids these signs of model writing:
  - lists of three by habit;
  - "not X but Y" contrasts;
  - stacked abstract nouns ("robust principled frameworks");
  - closing summary sentences;
  - every sentence the same length;
  - openers like "Our work explores".

## Pass 3: swap and cross-read

Each of us reads every page the other drafted. Leave comments as GitHub issues, or edit directly and say so in the commit message. Resolve disagreements in a call, not in commits.

## Pass 4: before sharing

- [ ] Each student and collaborator gets the People page link and checks their own entry, link, and description. Anyone with a portrait agrees to its use.
- [ ] Check every external link (about 150) for breaks. Claude can run this.
- [ ] Check `www.exproof.ai` and the old github.io address redirect to `https://exproof.ai`.
- [ ] Test the link preview by pasting the URL into Slack, LinkedIn, and X.
- [ ] Check the site on two real phones.
- [ ] Add `robots.txt` and `sitemap.xml`, and register the site with Google Search Console, which verifies through Cloudflare DNS.
- [ ] Optionally add Cloudflare Web Analytics. It is free, sets no cookies, and shows whether sharing reaches anyone.
- [ ] Close out `CONTENT_REVIEW.md`: restore, drop, or confirm each item.
- [ ] Decide whether the footer's "Updated" date stays. If it stays, someone has to keep it current.
- [ ] Before the broad share, send the site to five readers and ask each for one sentence on what the group does. Fix any page they misdescribe.

## Decisions that are easy to miss

1. **Contact address.** Work with us invites people to write, but the only addresses on the site are our personal ones. A free Cloudflare Email Routing address such as `contact@exproof.ai` could forward to both of us and would survive job moves. Decide who answers incoming mail.
2. **University names.** CMU and UNC may have rules on naming them in connection with a group that is not a university unit. Check before the broad share whether "lab" or "group" is the right word.
3. **Funder acknowledgments.** If any listed work was grant-funded, the grant may require an acknowledgment.
4. **Account access.** The domain and the Cloudflare account are Aydin's. Add Daniel as a member of the Cloudflare account, and keep auto-renew on. The domain renews every two years.
5. **Public repository.** The repository and its full history are public, including `DESIGN.md`, `CONTENT_REVIEW.md`, and removed drafts. Anything we would not want read should come out now.
6. **Announcement.** Draft the announcement post or email, and decide who sends it, where, and when.
7. **Upkeep.** Name one owner per month for new papers, talks, and people, so the site stays current after launch.

## Page tracker

| Page | Kind | Owner | Pass 2 drafted | Pass 3 cross-read |
|---|---|---|---|---|
| index.html | A |  |  |  |
| about.html | A |  |  |  |
| research.html | A |  |  |  |
| work-with-us.html | A |  |  |  |
| adaptations.html | B |  |  |  |
| naturalizing-agency.html | B |  |  |  |
| measuring-attitudes.html | B |  |  |  |
| value-uncertainty.html | B |  |  |  |
| delegation.html | B |  |  |  |
| publications.html | C |  | n/a |  |
| people.html | C |  | n/a |  |
