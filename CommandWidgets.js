//
// Command Widgets Library
//
// Copyright (c) 2001 - 2002 Nikhil Dabas
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
//

// Error Constants

var ERR_INVALID_VALUE = new CWException(6000, "Invalid property value");
var ERR_INVALID_ARGUMENT = new CWException(6001, "Invalid argument");

function CWException(number, message)
{
  this.message = message;
  this.description = message;
  this.number = number;
  this.name = "CWException";
}


// Global Functions

function CancelEvent()
{
  event.cancelBubble = true;
  event.returnValue = false;
}

function GetBoolValue(newValue)
{
  newValue = newValue.toString().toLowerCase();
  if(newValue == "false" || newValue == "no" || newValue == "0")
    return false;
  else
    return true;
}

function UpdatePrompt()
{
  if(prompt)
  {
    var parts = prompt.split("|");
    element.status = parts[0];
    element.title = parts[1];
  }
}

function CWInit(container)
{
  if(window._CWMan == null)
    window._CWMan = new CWMan(container);
}


// The Command Widgets Coordinator class

function CWMan(container)
{
  this.popups = new PopupMan();
  this.container = container;
  this.dock = new DockMan();
}


// The popup manager

var Z_BASE = 100;

function PopupMan()
{
  this.all = new Array();
  this.Add = PopupMan_Add;
  this.Remove = PopupMan_Remove;
  this.SetMaxLevel = PopupMan_SetMaxLevel;
  this.GetMaxLevel = PopupMan_GetMaxLevel;
}

function PopupMan_Add(elem, level)
{
  if(level < 0)
  {
    throw ERR_INVALID_ARGUMENT;
    return false;
  }
  
  // Check if the element is already in the all array.
  for(i = 0; i < this.all.length; i++)
  {
    if(this.all[i] == elem && i == level)
    {
      return true;
    }
  }
  
  this.SetMaxLevel(level - 1);
  this.all.push(elem);
  elem.style.zIndex = Z_BASE + level;
  
  return true;
}

function PopupMan_Remove(elem)
{
  var i;
  var found = false;
  for(i = 0; i < this.all.length; i++)
  {
    if(this.all[i] == elem)
    {
      found = true;
      break;
    }
  }
  
  if(!found)
  {
    throw ERR_INVALID_ARGUMENT;
    return false;
  }
  
  this.SetMaxLevel(i + 1);
  this.all.pop().HideMenu();
  
  return true;
}

function PopupMan_SetMaxLevel(level)
{
  for(var i = this.all.length - 1; i > level; i--)
  {
    this.all.pop().HideMenu();
  }
  
  return true;
}

function PopupMan_GetMaxLevel()
{
  return this.all.length - 1;
}


// The Docking Manager

function DockMan()
{
  this.items = new Object();
  this.items.dockedTop = new Array();
  this.items.dockedLeft = new Array();
  this.items.dockedBottom = new Array();
  this.items.dockedRight = new Array();
  this.Dock = DockMan_Dock;
  this.Free = DockMan_Free;
  this.UpdateLayout = DockMan_UpdateLayout;
}

function DockMan_Dock(elem)
{
  var arr;
  switch(elem.dock)
  {
    case "top":
      arr = this.items.dockedTop;
      break;
    case "left":
      arr = this.items.dockedLeft;
      break;
    case "bottom":
      arr = this.items.dockedBottom;
      break;
    case "right":
      arr = this.items.dockedRight;
      break;
    default:
      arr = null;
  }
  
  if(arr != null)
  {
    var previous = null;
    if(arr.length)
    {
      previous = arr[arr.length - 1];
    }
    DockMan_Position(elem, previous);
    arr.push(elem);
    return true;
  }
  else
  {
    return false;
  }
}

function DockMan_Free(elem)
{
  var arr;
  var swapper = new Array();
  var found = false;
  var i;
  
  switch(elem.dock)
  {
    case "top":
      arr = this.items.dockedTop;
      break;
    case "left":
      arr = this.items.dockedLeft;
      break;
    case "bottom":
      arr = this.items.dockedBottom;
      break;
    case "right":
      arr = this.items.dockedRight;
      break;
    default:
      arr = null;
  }
  
  if(!arr)
    return false;
  
  for(i = 0; i < arr.length; i++)
  {
    if(arr[i] == elem)
    {
      found = true;
      break;
    }
  }
  
  if(!found)
    return false;
  
  // Remove the element from the correct array and fill
  // the void left.
  while(arr.length > i)
  {
    swapper.push(arr.pop());
  }
  void swapper.pop();
  while(swapper.length)
  {
    arr.push(swapper.pop());
  }
  
  return true;
}

function DockMan_Position(elem, previous)
{
  var x = 0, y = 0;
  var node;
  
  if(previous)
  {
    node = previous;
  }
  else
  {
    node = window._CWMan.container;
  }
  while(node != null)
  {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  
  switch(elem.dock)
  {
    case "top":
      if(previous)
      {
        x += previous.offsetWidth;
      }
      if(x + elem.offsetWidth > window._CWMan.container.offsetWidth)
      {
        elem.style.posWidth = window._CWMan.container.offsetWidth - x;
      }
      else
      {
        elem.style.width = "auto";
      }
      break;
    
    case "bottom":
      if(previous)
      {
        x += previous.offsetWidth;
      }
      else
      {
        y += window._CWMan.container.offsetHeight;
        y -= elem.offsetHeight;
      }
      if(x + elem.offsetWidth > window._CWMan.container.offsetWidth)
      {
        elem.style.posWidth = window._CWMan.container.offsetWidth - x;
      }
      else
      {
        elem.style.width = "auto";
      }
      break;
    
    case "left":
      break;
    
    case "right":
      break;
    
    default:
      break;
  }
  
  elem.style.posTop = y;
  elem.style.posLeft = x;
}

function DockMan_PositionAll(arr)
{
  var previous;
  
  for(i = 0; i < arr.length; i++)
  {
    if(i)
    {
      previous = arr[i - 1];
    }
    else
    {
      previous = null;
    }
    DockMan_Position(arr[i], previous);
  }
}

function DockMan_UpdateLayout()
{
  DockMan_PositionAll(this.items.dockedTop);
  DockMan_PositionAll(this.items.dockedLeft);
  DockMan_PositionAll(this.items.dockedRight);
  DockMan_PositionAll(this.items.dockedBottom);
}


// The Skin Manager class

function SkinMan(oElement, sBaseName)
{
	this.elem = oElement;
	this.baseName = sBaseName;
	this.ApplyClass = SkinMan_ApplyClass;
}

function SkinMan_ApplyClass(auxName)
{
	// Remove any existing skin
	var classes = this.elem.className.split(" ");
	for(key in classes)
	{
	  // Remove any applied style classes, except for the base class.
	  if(classes[key].indexOf(this.baseName) == 0 &&
	     classes[key] != this.baseName + "Base")
	    classes[key] = "";
	}
	this.elem.className = classes.join(" ");
	
	// Trim the string
	this.elem.className = this.elem.className.replace(/(^\s*)|(\s*$)/g, "");
	
	// Add the specified class
	this.elem.className += " " + this.baseName + auxName;
	
	return true;
}

// Debug

var debugging = true;

function ASSERT(value)
{
  if(debugging && !value)
  {
    alert("Debug assertion failed!");
    debugger;
  }
}

function TRACE(message)
{
  if(!debugging)
    return;
  
  if(window._traceWnd == null || window._traceWnd.closed)
  {
    window._traceWnd = window.open("Debug.htm", "Debug",
      "toolbar=0,location=0,directories=0,status=0," +
      "menubar=0,scrollbars=1,resizable=1,width=600,height=100");
  }
  try { window._traceWnd.WriteMessage(message); }
  catch(e) {}
}