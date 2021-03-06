/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is sessionstore test code.
 *
 * The Initial Developer of the Original Code is
 * Simon Bünzli <zeniko@gmail.com>.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

function test() {
  /** Test for Bug 346337 **/

  var file = Components.classes["@mozilla.org/file/directory_service;1"]
               .getService(Components.interfaces.nsIProperties)
               .get("TmpD", Components.interfaces.nsILocalFile);
  file.append("346337_test1.file");
  let filePath1 = file.path;
  file = Components.classes["@mozilla.org/file/directory_service;1"]
             .getService(Components.interfaces.nsIProperties)
             .get("TmpD", Components.interfaces.nsILocalFile);
  file.append("346337_test2.file");
  let filePath2 = file.path;

  let fieldList = {
    "//input[@name='input']":     Date.now().toString(),
    "//input[@name='spaced 1']":  Math.random().toString(),
    "//input[3]":                 "three",
    "//input[@type='checkbox']":  true,
    "//input[@name='uncheck']":   false,
    "//input[@type='radio'][1]":  false,
    "//input[@type='radio'][2]":  true,
    "//input[@type='radio'][3]":  false,
    "//select":                   2,
    "//select[@multiple]":        [1, 3],
    "//textarea[1]":              "",
    "//textarea[2]":              "Some text... " + Math.random(),
    "//textarea[3]":              "Some more text\n" + new Date(),
    "//input[@type='file'][1]":   [filePath1],
    "//input[@type='file'][2]":   [filePath1, filePath2]
  };

  function getElementByXPath(aTab, aQuery) {
    let doc = aTab.linkedBrowser.contentDocument;
    let xptype = Components.interfaces.nsIDOMXPathResult.FIRST_ORDERED_NODE_TYPE;
    return doc.evaluate(aQuery, doc, null, xptype, null).singleNodeValue;
  }

  function setFormValue(aTab, aQuery, aValue) {
    let node = getElementByXPath(aTab, aQuery);
    if (typeof aValue == "string")
      node.value = aValue;
    else if (typeof aValue == "boolean")
      node.checked = aValue;
    else if (typeof aValue == "number")
      node.selectedIndex = aValue;
    else if (node instanceof Components.interfaces.nsIDOMHTMLInputElement && node.type == "file")
      node.mozSetFileNameArray(aValue, aValue.length);
    else
      Array.forEach(node.options, function(aOpt, aIx)
                                    (aOpt.selected = aValue.indexOf(aIx) > -1));
  }

  function compareFormValue(aTab, aQuery, aValue) {
    let node = getElementByXPath(aTab, aQuery);
    if (!node)
      return false;
    if (node instanceof Components.interfaces.nsIDOMHTMLInputElement) {
      if (node.type == "file") {
        let fileNames = node.mozGetFileNameArray();
        return fileNames.length == aValue.length &&
               Array.every(fileNames, function(aFile) aValue.indexOf(aFile) >= 0);
      }
      return aValue == (node.type == "checkbox" || node.type == "radio" ?
                        node.checked : node.value);
    }
    if (node instanceof Components.interfaces.nsIDOMHTMLTextAreaElement)
      return aValue == node.value;
    if (!node.multiple)
      return aValue == node.selectedIndex;
    return Array.every(node.options, function(aOpt, aIx)
                                       (aValue.indexOf(aIx) > -1) == aOpt.selected);
  }

  // test setup
  let tabbrowser = getBrowser();
  waitForExplicitFinish();

  // make sure we don't save form data at all (except for tab duplication)
  Services.prefs.setIntPref("browser.sessionstore.privacy_level", 2);

  let rootDir = getRootDirectory(gTestPath);
  let testURL = rootDir + "browser_346337_sample.html";
  let tab = tabbrowser.addTab(testURL);
  tab.linkedBrowser.addEventListener("load", function loadListener1(aEvent) {
    tab.linkedBrowser.removeEventListener("load", loadListener1, true);
    for (let xpath in fieldList)
      setFormValue(tab, xpath, fieldList[xpath]);

    let tab2 = ss.duplicateTab(window,tab);
    tab2.linkedBrowser.addEventListener("pageshow", function pageshowListener2(aEvent) {
      tab2.linkedBrowser.removeEventListener("pageshow", pageshowListener2, true);
      for (let xpath in fieldList)
        ok(compareFormValue(tab2, xpath, fieldList[xpath]),
           "The value for \"" + xpath + "\" was correctly restored");
      let browser = tab.linkedBrowser;
      browser.addEventListener("load", function pageshowListener3(aEvent) {
        browser.removeEventListener("load", pageshowListener3, true);
        let tab3 = tabbrowser.undoCloseTab(0);
        tab3.linkedBrowser.addEventListener("pageshow", function pageshowListener4(aEvent) {
          tab3.linkedBrowser.removeEventListener("pageshow", pageshowListener4, true);
          for (let xpath in fieldList)
            if (fieldList[xpath])
              ok(!compareFormValue(tab3, xpath, fieldList[xpath]),
                 "The value for \"" + xpath + "\" was correctly discarded");

        if (Services.prefs.prefHasUserValue("browser.sessionstore.privacy_level"))
          Services.prefs.clearUserPref("browser.sessionstore.privacy_level");
          // undoCloseTab can reuse a single blank tab, so we have to
          // make sure not to close the window when closing our last tab
          if (tabbrowser.tabContainer.childNodes.length == 1)
            tabbrowser.addTab();
          tabbrowser.removeTab(tab3);
          finish();
        }, true);
      }, true);
      // clean up
      tabbrowser.removeTab(tab2);
      tabbrowser.removeTab(tab);
    }, true);
  }, true);
}
