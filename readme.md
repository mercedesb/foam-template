# Foam

👋 Welcome to your new Foam Workspace!

## Getting started

This documentation assumes that you have a GitHub account and have [Visual Studio Code](https://code.visualstudio.com/) installed on your Linux/MacOS/Windows machine.

1. If you haven't yet, browse over to the main [Foam documentation workspace](https://foambubble.github.io/foam) to get an idea of what Foam is and how to use it.
2. Press "Use this template" button at [foam-template](https://github.com/foambubble/foam-template/generate) (that's this repository!) to fork it to your own GitHub account. If you want to keep your thoughts to yourself, remember to set the repository private.
3. [Clone the repository to your local machine](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository) and open it in VS Code.

    *Open the repository as a folder using the `File > Open...` menu item. In VS Code, "open workspace" refers to [multi-root workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces).*

4. When prompted to install recommended extensions, click **Install all** (or **Show Recommendations** if you want to review and install them one by one)

After setting up the repository, open [.vscode/settings.json](.vscode/settings.json) and edit, add or remove any settings you'd like for your Foam workspace.

To learn more about how to use **Foam**, read the [Recipes](https://foambubble.github.io/foam/recipes) bubbles of the Foam documentation workspace.


## Using Foam

We've created a few Bubbles (markdown documents) to get you started.

- [[inbox]] - a place to write down quick notes to be categorised later
- [[foam-tips]] - tips to get the most out of your Foam workspace
- [[todo]] - a place to keep track of things to do

## Note on `[[wiki-links]]`

⚠️ Until [foambubble/foam#16](https://github.com/foambubble/foam/issues/16) is resolved, `[[wiki-links]]` links (like the links above) won't work in the GitHub Markdown preview (i.e. this Readme on github.com).

They should work as expected in VS Code, and in rendered GitHub Pages.

If GitHub preview (or general 100% support with all Markdown tools) is a requirement, for the time being you can use the standard `[description](page.md)` syntax.

## Mercedes' customizations

### Backlinks

`yarn backlinks` will add a section for backlinks at the bottom of any note that
    is linked to by another note. This is helpful for automating maintenance
    of seeing where else in the repo you reference this note.
    
    With the use of the Markdown Links extension, you'll be able to see a
    graph of how different notes in your repo are related.

It looks like this
```markdown
## Backlinks

- [[note that is referencing current note]]
	- Text that is linked [[link to current note]]
- [[other note that is referncing current note]]
    - Text in that note that links [[link to current note]]
```

### Tags

It can be nice to tag notes with topics. `yarn tags` automates creating a way to find all notes for a specific tag. The script creates a `tags` directory at the root and creates a file in it for each unique tag found in your notes. The file has a bulleted list linking to each note that uses that tag.

To add tags to a file, include a heading 3 called tags and then comma separate your tags in the paragraph below.
    
```markdown
### tags

tag 1, tag 2, tag 3

## a different heading
    
this content is not tag content
```

This will result in 3 files in the `tags` directory, `tag 1.md`, `tag 2.md`, and `tag 3.md` with a lit item linking to this note.

### Directory table of contents

Included in this repo is a script to make a table of contents for a directory. `make-toc.js` will create an `index.md` file with a bulleted list of links to the files of the specified directory.

### `yarn links`
`yarn links` is a script to tie all of the above functionality together in one command. `yarn links` will do all of your backlink and tag maintenance, as well as make a table of contents in the `tags` directory to make it easy to view all the tags in your repo in one place.

### `read-files.js`
All of the scripts in this project are simple Node scripts. If you have an idea to make your Foam workspace more your own, go for it! `read-files.js` contains functionality for recursively reading all files and their content for a specified directory. It will return an array of objects with the title, name, directory, tree (from markdown parsing), and contents for each file. 

Feel free to use this to hit the ground running on your next idea!

### Other
At the time of this writing (2020/10/15), I'm not a fan of Foam's extension and keep it disabled. Maybe that will change as they do more development, but right now I don't love the automated extra content it adds at the end of files.