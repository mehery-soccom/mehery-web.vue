import { useEmailStore } from '@app/views/apps/email/useEmailStore'

export const useEmail = () => {
  const route = useRoute()
  const store = useEmailStore()

  const emailMoveToFolderActions = [
    { action: 'inbox', icon: 'tabler-mail' },
    { action: 'spam', icon: 'tabler-alert-octagon' },
    { action: 'trash', icon: 'tabler-trash' },
  ]

  const labels = [
    {
      title: 'personal',
      color: 'success',
    },
    {
      title: 'company',
      color: 'primary',
    },
    {
      title: 'important',
      color: 'warning',
    },
    {
      title: 'private',
      color: 'error',
    },
  ]

  const resolveLabelColor = label => {
    if (label === 'personal')
      return 'success'
    if (label === 'company')
      return 'primary'
    if (label === 'important')
      return 'warning'
    if (label === 'private')
      return 'error'
    
    return 'secondary'
  }

  const shallShowMoveToActionFor = action => {
    if (action === 'trash')
      return route.params.filter !== 'trashed'
    else if (action === 'inbox')
      return !(route.params.filter === undefined || route.params.filter === 'sent' || route.params.filter === 'draft')
    else if (action === 'spam')
      return !(route.params.filter === 'spam' || route.params.filter === 'sent' || route.params.filter === 'draft')
    
    return false
  }

  const moveSelectedEmailTo = (action, selectedEmails) => {
    const dataToUpdate = {}
    if (action === 'inbox') {
      if (route.params.filter === 'trashed')
        dataToUpdate.isDeleted = false
      dataToUpdate.folder = 'inbox'
    }
    else if (action === 'spam') {
      if (route.params.filter === 'trashed')
        dataToUpdate.isDeleted = false
      dataToUpdate.folder = 'spam'
    }
    else if (action === 'trash') {
      dataToUpdate.isDeleted = true
    }
    store.updateEmails(selectedEmails, dataToUpdate)
  }

  return {
    labels,
    resolveLabelColor,
    shallShowMoveToActionFor,
    emailMoveToFolderActions,
    moveSelectedEmailTo,
  }
}
