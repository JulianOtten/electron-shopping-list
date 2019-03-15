// Require packages
const electron = require("electron");
const url = require("url");
const path = require("path");
// Pull out needed objects
const { app, BrowserWindow, Menu, ipcMain} = electron;

// Have the application run in production
process.env.NODE_ENV = 'production';

// Define application windows (filled later)
let mainWindow;
let addWindow;

// Once the application is ready
app.on("ready", () => {
  // Create a new window
  mainWindow = new BrowserWindow({});
  // Load the mainWindow.html into the mainWindow 
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );

  // If someone closes mainWindow, close all other windows
  mainWindow.on("closed", () => {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Set the top menu 
  Menu.setApplicationMenu(mainMenu);
});

/**
 * Ceate the add item window
 * 
 * @return void
 */
function createAddWindow() {
  // Deifne window settings
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add Shopping List Item"
  });
  // Load the addWindow html into the window
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "addWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );

  // Once the addWindow is closed, clean out the variable, "garbage collection"
  addWindow.on("close", () => {
    addWindow = null;
  });
}

// Catch item:add from addWindow
ipcMain.on('item:add', (event, item) => {
  // Send item to mainWindow (I have no clue why it isnt send there directly)
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

// Menu template
const mainMenuTemplate = [
  {
    // Name of the menu item
    label: "File",
    // Submenu for File
    submenu: [
      {
        // name of the submenu item
        label: "Add Item",
        // the function that gets called once you click on the item
        click() {
          createAddWindow();
        }
      },
      {
        label: "Clear Items",
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: "Quit",
        // Key shortcuts. process.platform == "darwin" is a macOs check. if Os == mac use Command+Q, else use Ctrl+Q. shortcuts also run the click function
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          // quit the app
          app.quit();
        }
      }
    ]
  }
];

/* Mac has a weird bug where it doesnt display the first menu item properly. 
For mac you add an empty menu item.
any other platform shouldnt have this empty menu item as it will look weird */
if (process.platform == "darwin") mainMenuTemplate.unshift({});

// If the application is not running in production, add the option to open Devtools and a reload
if(process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label:'Toggle DevTools',
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          // toggle the devtools on or off in the focused window
          focusedWindow.toggleDevTools();
        }
      },
      {
        // Adds reload functionality. this already excists within electron
        role: 'reload'
      }
    ]
  });
}