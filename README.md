# Connecteam Position View

This is a web browser extension and python script designed to pull all shifts from a Connecteam schedule and create a pretty graph that is easy to read, respectively.
*********************
### How to use:

Installing the Extension:
  1. Merge the provided registry file
  2. Restart your intended browser
  3. Go to your browsers extension page and turn on developer mode
  4. Drag the relavent extension file (chromium.crx) onto the extension page
  5. Ensure that the extension is enabled

Usage:
  1. Open a connecteam shift scheduler page
  2. Click on the "Today" button in the top right
  3. Wait for the `shifts-today.csv` file to download
    - If you want the reset of the week, scroll to the top of the page and click the "Rest of week" button
    - Wait for all shift data files to download
  4. Drag each downloaded `csv` file over the provided `position_view.exe` file to convert the data to an image
    - If you would like, you can then download the image to save it elsewhere
