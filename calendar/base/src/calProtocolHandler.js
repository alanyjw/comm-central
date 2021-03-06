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
 * The Original Code is Mozilla Calendar code.
 *
 * The Initial Developer of the Original Code is
 *   Michiel van Leeuwen <mvl@exedo.nl>.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Philipp Kewisch <mozilla@kewis.ch>
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


/** Constructor for webcal: protocol handler */
function calProtocolHandlerWebcal() {
    calProtocolHandler.call(this, "webcal");
}

/** Constructor for webcals: protocl handler */
function calProtocolHandlerWebcals() {
    calProtocolHandler.call(this, "webcals");
}

/**
 * Generic webcal constructor
 *
 * @param scheme        The scheme to init for (webcal, webcals)
 */
function calProtocolHandler(scheme) {
    this.scheme = scheme;
    this.mHttpProtocol = cal.getIOService().getProtocolHandler(this.scheme == "webcal" ? "http" : "https");
}

calProtocolHandler.prototype = {
    getInterfaces: function cP_getInterfaces(aCount) {
        const interfaces = [Components.interfaces.nsIProtocolHandler,
                            Components.interfaces.nsIClassInfo,
                            Components.interfaces.nsISupports];

        aCount.value = interfaces.length;
        return interfaces;
    },
    getHelperForLanguage: function cP_getHelperForLanguage(aLang) {
        return null;
    },
    classDescription: "Calendar webcal(s) protocal handler",
    /* classID/contractID is filled in at the end of this file */
    implementationLanguage: Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT,
    flags: 0,

    QueryInterface: function cph_QueryInterface(aIID) {
        return cal.doQueryInterface(this, calProtocolHandler.prototype, aIID, null, this);
    },

    get defaultPort() {
        return this.mHttpProtocol.defaultPort;
    },

    get protocolFlags() {
        return this.mHttpProtocol.protocolFlags;
    },

    newURI: function cph_newURI(aSpec, anOriginalCharset, aBaseURI) {
        var uri = Components.classes["@mozilla.org/network/standard-url;1"].
                             createInstance(Components.interfaces.nsIStandardURL);
        uri.init(Components.interfaces.nsIStandardURL.URLTYPE_STANDARD, 
                 this.mHttpProtocol.defaultPort, aSpec, anOriginalCharset, aBaseURI);
        return uri;
    },
    
    newChannel: function cph_newChannel(aUri) {
        // make sure to clone the uri, because we are about to change
        // it, and we don't want to change the original uri.
        var uri = aUri.clone();
        uri.scheme = this.mHttpProtocol.scheme;

        var channel = getIOService().newChannelFromURI(uri, null);
        channel.originalURI = aUri;
        return channel;
    },
    
    allowPort: function cph_allowPort(aPort, aScheme) {
        // We are not overriding any special ports
        return false;
    }
};

calProtocolHandlerWebcal.prototype = {
    __proto__: calProtocolHandler.prototype,
    contractID: "@mozilla.org/network/protocol;1?name=webcal",
    classID: Components.ID("{1153c73a-39be-46aa-9ba9-656d188865ca}")
};
calProtocolHandlerWebcals.prototype = {
    __proto__: calProtocolHandler.prototype,
    contractID: "@mozilla.org/network/protocol;1?name=webcals",
    classID: Components.ID("{bdf71224-365d-4493-856a-a7e74026f766}")
};

