# Puppeteer Capture Helper

## How To Use

### Use a file containing the urls to be taken screenshot
First, create a text file with name **urls.txt** for example. 
The **urls.txt** maybe something like the following with the urls line by line.
```
www.example.com
www.google.com
www.medium.com
```
When using bash, you can use the following command.
```bash
cat urls.txt | xargs puppeteer-capture-helper screenshot
```

When using powershell, you can use the following command.
```cmd
,@(cat .\urls.txt) | %{puppeteer-capture-helper screenshot $_}
```

