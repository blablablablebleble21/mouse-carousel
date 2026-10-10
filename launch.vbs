Option Explicit

Dim shell, fileSystem, appDirectory
Set shell = CreateObject("WScript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")
appDirectory = fileSystem.GetParentFolderName(WScript.ScriptFullName)

' 0 = hidden window, False = do not wait for the background process.
shell.Run "cmd.exe /c """ & appDirectory & "\run-app.bat""", 0, False
