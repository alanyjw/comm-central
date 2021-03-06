/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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

#include "nsMsgAttachment.h"
#include "nsILocalFile.h"
#include "nsNetUtil.h"

NS_IMPL_ISUPPORTS1(nsMsgAttachment, nsIMsgAttachment)

nsMsgAttachment::nsMsgAttachment()
{
  mTemporary = false;
  mSendViaCloud = false;
  mSize = -1;
}

nsMsgAttachment::~nsMsgAttachment()
{
  if (mTemporary && !mSendViaCloud)
    (void)DeleteAttachment();
}

/* attribute wstring name; */
NS_IMETHODIMP nsMsgAttachment::GetName(nsAString & aName)
{
  aName = mName;
  return NS_OK;
}

NS_IMETHODIMP nsMsgAttachment::SetName(const nsAString & aName)
{
  mName = aName;
  return NS_OK;
}

/* attribute string url; */
NS_IMETHODIMP nsMsgAttachment::GetUrl(nsACString & aUrl)
{
  aUrl = mUrl;
  return NS_OK;
}

NS_IMETHODIMP nsMsgAttachment::SetUrl(const nsACString & aUrl)
{
  mUrl = aUrl;
  return NS_OK;
}

/* attribute string urlCharset; */
NS_IMETHODIMP nsMsgAttachment::GetUrlCharset(nsACString & aUrlCharset)
{
  aUrlCharset = mUrlCharset;
  return NS_OK;
}
NS_IMETHODIMP nsMsgAttachment::SetUrlCharset(const nsACString & aUrlCharset)
{
  mUrlCharset = aUrlCharset;
  return NS_OK;
}

/* attribute boolean temporary; */
NS_IMETHODIMP nsMsgAttachment::GetTemporary(bool *aTemporary)
{
  NS_ENSURE_ARG_POINTER(aTemporary);

  *aTemporary = mTemporary;
  return NS_OK;
}
NS_IMETHODIMP nsMsgAttachment::SetTemporary(bool aTemporary)
{
  mTemporary = aTemporary;
  return NS_OK;
}

NS_IMETHODIMP nsMsgAttachment::GetSendViaCloud(bool *aSendViaCloud)
{
  NS_ENSURE_ARG_POINTER(aSendViaCloud);

  *aSendViaCloud = mSendViaCloud;
  return NS_OK;
}
NS_IMETHODIMP nsMsgAttachment::SetSendViaCloud(bool aSendViaCloud)
{
  mSendViaCloud = aSendViaCloud;
  return NS_OK;
}

NS_IMETHODIMP nsMsgAttachment::SetHtmlAnnotation(const nsAString &aAnnotation)
{
  mHtmlAnnotation = aAnnotation;
  return NS_OK;
}

NS_IMETHODIMP nsMsgAttachment::GetHtmlAnnotation(nsAString &aAnnotation)
{
  aAnnotation = mHtmlAnnotation;
  return NS_OK;
}

NS_IMETHODIMP
nsMsgAttachment::SetCloudProviderKey(const nsACString &aCloudProviderKey)
{
  mCloudProviderKey = aCloudProviderKey;
  return NS_OK;
}

NS_IMETHODIMP
nsMsgAttachment::GetCloudProviderKey(nsACString &aCloudProviderKey)
{
  aCloudProviderKey = mCloudProviderKey;
  return NS_OK;
}

NS_IMETHODIMP nsMsgAttachment::GetContentLocation(nsACString &aContentLocation)
{
  aContentLocation = mContentLocation;
  return NS_OK;
}

NS_IMETHODIMP nsMsgAttachment::SetContentLocation(const nsACString &aContentLocation)
{
  mContentLocation = aContentLocation;
  return NS_OK;
}

NS_IMETHODIMP nsMsgAttachment::GetContentType(char * *aContentType)
{
  NS_ENSURE_ARG_POINTER(aContentType);

  *aContentType = ToNewCString(mContentType);
  return (*aContentType ? NS_OK : NS_ERROR_OUT_OF_MEMORY);
}

NS_IMETHODIMP nsMsgAttachment::SetContentType(const char * aContentType)
{
  mContentType = aContentType;
  /* a full content type could also contains parameters but we need to
     keep only the content type alone. Therefore we need to cleanup it.
  */
  PRInt32 offset = mContentType.FindChar(';');
  if (offset >= 0)
    mContentType.SetLength(offset);

  return NS_OK;
}

NS_IMETHODIMP nsMsgAttachment::GetContentTypeParam(char * *aContentTypeParam)
{
  NS_ENSURE_ARG_POINTER(aContentTypeParam);

  *aContentTypeParam = ToNewCString(mContentTypeParam);
  return (*aContentTypeParam ? NS_OK : NS_ERROR_OUT_OF_MEMORY);
}

NS_IMETHODIMP nsMsgAttachment::SetContentTypeParam(const char * aContentTypeParam)
{
  if (aContentTypeParam)
    while (*aContentTypeParam == ';' || *aContentTypeParam == ' ')
      aContentTypeParam ++;
  mContentTypeParam = aContentTypeParam;

  return NS_OK;
}

/* attribute string charset; */
NS_IMETHODIMP nsMsgAttachment::GetCharset(char * *aCharset)
{
  NS_ENSURE_ARG_POINTER(aCharset);

  *aCharset = ToNewCString(mCharset);
  return (*aCharset ? NS_OK : NS_ERROR_OUT_OF_MEMORY);
}
NS_IMETHODIMP nsMsgAttachment::SetCharset(const char * aCharset)
{
  mCharset = aCharset;
  return NS_OK;
}

/* attribute string macType; */
NS_IMETHODIMP nsMsgAttachment::GetMacType(char * *aMacType)
{
  NS_ENSURE_ARG_POINTER(aMacType);

  *aMacType = ToNewCString(mMacType);
  return (*aMacType ? NS_OK : NS_ERROR_OUT_OF_MEMORY);
}
NS_IMETHODIMP nsMsgAttachment::SetMacType(const char * aMacType)
{
  mMacType = aMacType;
  return NS_OK;
}

/* attribute string macCreator; */
NS_IMETHODIMP nsMsgAttachment::GetMacCreator(char * *aMacCreator)
{
  NS_ENSURE_ARG_POINTER(aMacCreator);

  *aMacCreator = ToNewCString(mMacCreator);
  return (*aMacCreator ? NS_OK : NS_ERROR_OUT_OF_MEMORY);
}
NS_IMETHODIMP nsMsgAttachment::SetMacCreator(const char * aMacCreator)
{
  mMacCreator = aMacCreator;
  return NS_OK;
}

/* attribute PRInt64 size; */
NS_IMETHODIMP nsMsgAttachment::GetSize(PRInt64 *aSize)
{
  NS_ENSURE_ARG_POINTER(aSize);

  *aSize = mSize;
  return NS_OK;
}
NS_IMETHODIMP nsMsgAttachment::SetSize(PRInt64 aSize)
{
  mSize = aSize;
  return NS_OK;
}

/* boolean equalsUrl (in nsIMsgAttachment attachment); */
NS_IMETHODIMP nsMsgAttachment::EqualsUrl(nsIMsgAttachment *attachment, bool *_retval)
{
  NS_ENSURE_ARG_POINTER(attachment);
  NS_ENSURE_ARG_POINTER(_retval);

  nsCAutoString url;
  attachment->GetUrl(url);

  *_retval = mUrl.Equals(url);
  return NS_OK;
}


nsresult nsMsgAttachment::DeleteAttachment()
{
  nsresult rv;
  bool isAFile = false;

  nsCOMPtr<nsIFile> urlFile;
  rv = NS_GetFileFromURLSpec(mUrl, getter_AddRefs(urlFile));
  NS_ASSERTION(NS_SUCCEEDED(rv), "Can't nsIFile from URL string");
  if (NS_SUCCEEDED(rv))
  {
    bool bExists = false;
    rv = urlFile->Exists(&bExists);
    NS_ASSERTION(NS_SUCCEEDED(rv), "Exists() call failed!");
    if (NS_SUCCEEDED(rv) && bExists)
    {
      rv = urlFile->IsFile(&isAFile);
      NS_ASSERTION(NS_SUCCEEDED(rv), "IsFile() call failed!");
    }
  }

  // remove it if it's a valid file
  if (isAFile)
	  rv = urlFile->Remove(false); 

  return rv;
}
