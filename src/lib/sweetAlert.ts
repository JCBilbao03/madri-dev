import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

interface SwalTheme {
  background: string;
  color: string;
  cancelButtonColor: string;
}

function readTheme(): SwalTheme {
  const isLight = document.documentElement.classList.contains('light');

  return {
    background: isLight ? '#ffffff' : '#22252d',
    color: isLight ? '#1a1c22' : '#f4f4f5',
    cancelButtonColor: isLight ? '#ececf0' : '#353942',
  };
}

const swalBase = {
  buttonsStyling: false,
  customClass: {
    popup: 'swal-madri-popup',
    title: 'swal-madri-title',
    htmlContainer: 'swal-madri-text',
    actions: 'swal-madri-actions',
    confirmButton: 'swal-madri-btn swal-madri-btn-confirm',
    cancelButton: 'swal-madri-btn swal-madri-btn-cancel',
  },
};

function deleteConfirmButtonClass(): string {
  return `${swalBase.customClass.confirmButton} swal-madri-btn-danger`;
}

function actionConfirmButtonClass(): string {
  return `${swalBase.customClass.confirmButton} swal-madri-btn-primary`;
}

function toastMixin() {
  const theme = readTheme();

  return Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3200,
    timerProgressBar: true,
    background: theme.background,
    color: theme.color,
    customClass: {
      popup: 'swal-madri-toast',
      title: 'swal-madri-toast-title',
      htmlContainer: 'swal-madri-toast-text',
      timerProgressBar: 'swal-madri-toast-progress',
    },
  });
}

export async function confirmDelete(options: {
  title: string;
  text: string;
  confirmText?: string;
}): Promise<boolean> {
  const theme = readTheme();
  const result = await Swal.fire({
    ...swalBase,
    customClass: {
      ...swalBase.customClass,
      confirmButton: deleteConfirmButtonClass(),
    },
    title: options.title,
    text: options.text,
    icon: 'warning',
    iconColor: '#fb7185',
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? 'Delete',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    focusCancel: true,
    background: theme.background,
    color: theme.color,
  });

  return result.isConfirmed;
}

export async function confirmAction(options: {
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  icon?: 'warning' | 'question' | 'info';
}): Promise<boolean> {
  const theme = readTheme();
  const result = await Swal.fire({
    ...swalBase,
    customClass: {
      ...swalBase.customClass,
      confirmButton: actionConfirmButtonClass(),
    },
    title: options.title,
    text: options.text,
    icon: options.icon ?? 'question',
    iconColor: '#fdb813',
    showCancelButton: true,
    confirmButtonText: options.confirmText ?? 'Confirm',
    cancelButtonText: options.cancelText ?? 'Cancel',
    reverseButtons: true,
    focusCancel: true,
    background: theme.background,
    color: theme.color,
  });

  return result.isConfirmed;
}

export function showSuccessAlert(title: string, text?: string): void {
  const theme = readTheme();
  void Swal.fire({
    ...swalBase,
    customClass: {
      ...swalBase.customClass,
      confirmButton: actionConfirmButtonClass(),
    },
    title,
    text,
    icon: 'success',
    iconColor: '#fdb813',
    confirmButtonText: 'OK',
    background: theme.background,
    color: theme.color,
  });
}

export function showErrorAlert(title: string, text?: string): void {
  const theme = readTheme();
  void Swal.fire({
    ...swalBase,
    customClass: {
      ...swalBase.customClass,
      confirmButton: actionConfirmButtonClass(),
    },
    title,
    text,
    icon: 'error',
    iconColor: '#fb7185',
    confirmButtonText: 'OK',
    background: theme.background,
    color: theme.color,
  });
}

export function showSuccessToast(title: string, text?: string): void {
  void toastMixin().fire({
    icon: 'success',
    iconColor: '#fdb813',
    title,
    text,
  });
}

export function showErrorToast(title: string, text?: string): void {
  void toastMixin().fire({
    icon: 'error',
    iconColor: '#fb7185',
    title,
    text,
  });
}
