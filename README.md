# Connecteam Position View

This is a javascript program and python script designed to pull all shifts from a Connecteam schedule and create a pretty graph that is easy to read, respectively.
*********************
### How to use:

Part One: Collect the data
 1. Open the shift scheduler in Connecteam
 2. Copy and paste the contents on `inject.js` into the developer console for your browser
 3. Click on the position view button and wait for `shifts.csv` to download. (this can take a long time if the number of users in the schedule is less than the number of users in the organization)

Part Two: Make the chart from the data
  1. Drag the `shifts.csv` file onto `Position View.exe`
  2. Wait a few seconds and a graph should show up with everyone's schedules
  3. You can now save this graph as an image
