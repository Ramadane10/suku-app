import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useContext, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import fonts from '../constants/fonts';
import { useTheme } from '../hooks/useTheme';

type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AlertOptions {
    type?: AlertType;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    autoClose?: boolean;
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
    showSuccess: (title: string, message?: string) => void;
    showError: (title: string, message?: string) => void;
    showInfo: (title: string, message?: string) => void;
    showConfirm: (
        title: string,
        message: string,
        onConfirm: () => void,
        confirmText?: string,
        cancelText?: string
    ) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const [options, setOptions] = useState<AlertOptions | null>(null);

    const scaleValue = useRef(new Animated.Value(0.8)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    const animateIn = () => {
        setVisible(true);
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 6,
                tension: 80,
                useNativeDriver: true,
            }),
            Animated.timing(opacityValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const animateOut = (callback?: () => void) => {
        Animated.parallel([
            Animated.timing(scaleValue, {
                toValue: 0.85,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(opacityValue, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
            setOptions(null);
            if (callback) callback();
        });
    };

    const showAlert = (newOptions: AlertOptions) => {
        setOptions(newOptions);
        animateIn();

        if (newOptions.autoClose && newOptions.type !== 'confirm') {
            setTimeout(() => {
                animateOut();
            }, 3000);
        }
    };

    const showSuccess = (title: string, message?: string) => {
        showAlert({ type: 'success', title, message });
    };

    const showError = (title: string, message?: string) => {
        showAlert({ type: 'error', title, message });
    };

    const showInfo = (title: string, message?: string) => {
        showAlert({ type: 'info', title, message });
    };

    const showConfirm = (
        title: string,
        message: string,
        onConfirm: () => void,
        confirmText = 'Confirmer',
        cancelText = 'Annuler'
    ) => {
        showAlert({
            type: 'confirm',
            title,
            message,
            confirmText,
            cancelText,
            onConfirm,
        });
    };

    const hideAlert = () => {
        animateOut();
    };

    const handleConfirm = () => {
        const cb = options?.onConfirm;
        animateOut(cb);
    };

    const handleCancel = () => {
        const cb = options?.onCancel;
        animateOut(cb);
    };

    const getIconConfig = (type: AlertType = 'info') => {
        switch (type) {
            case 'success':
                return {
                    name: 'checkmark-circle' as const,
                    color: colors.success || '#2E7F34',
                    bg: (colors.success || '#2E7F34') + '1E',
                };
            case 'error':
                return {
                    name: 'close-circle' as const,
                    color: colors.danger || '#EA5455',
                    bg: (colors.danger || '#EA5455') + '1E',
                };
            case 'warning':
                return {
                    name: 'warning' as const,
                    color: colors.warning || '#F59E16',
                    bg: (colors.warning || '#F59E16') + '1E',
                };
            case 'confirm':
                return {
                    name: 'help-circle' as const,
                    color: colors.primary || '#2E7F34',
                    bg: (colors.primary || '#2E7F34') + '1E',
                };
            default:
                return {
                    name: 'information-circle' as const,
                    color: colors.primary || '#2E7F34',
                    bg: (colors.primary || '#2E7F34') + '1E',
                };
        }
    };

    const iconConfig = getIconConfig(options?.type);

    return (
        <AlertContext.Provider
            value={{ showAlert, showSuccess, showError, showInfo, showConfirm, hideAlert }}
        >
            {children}
            {options && (
                <Modal
                    transparent
                    visible={visible}
                    animationType="none"
                    onRequestClose={hideAlert}
                >
                    <View style={styles.overlay}>
                        <Animated.View
                            style={[
                                styles.backdrop,
                                { opacity: opacityValue },
                            ]}
                        >
                            <TouchableOpacity
                                style={StyleSheet.absoluteFill}
                                activeOpacity={1}
                                onPress={options.type === 'confirm' ? undefined : hideAlert}
                            />
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.modalCard,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    opacity: opacityValue,
                                    transform: [{ scale: scaleValue }],
                                },
                            ]}
                        >
                            <View style={[styles.iconBadge, { backgroundColor: iconConfig.bg }]}>
                                <Ionicons name={iconConfig.name} size={42} color={iconConfig.color} />
                            </View>

                            <Text style={[styles.title, { color: colors.text }]}>{options.title}</Text>

                            {options.message ? (
                                <Text style={[styles.message, { color: colors.textSecondary }]}>
                                    {options.message}
                                </Text>
                            ) : null}

                            {options.type === 'confirm' ? (
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.cancelBtn, { borderColor: colors.border }]}
                                        onPress={handleCancel}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[styles.cancelBtnText, { color: colors.text }]}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                        >
                                            {options.cancelText || 'Annuler'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.btn, styles.confirmBtn, { backgroundColor: colors.primary }]}
                                        onPress={handleConfirm}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.confirmBtnText} numberOfLines={1} adjustsFontSizeToFit>
                                            {options.confirmText || 'Confirmer'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.btn, styles.singleBtn, { backgroundColor: colors.primary }]}
                                    onPress={hideAlert}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.confirmBtnText} numberOfLines={1} adjustsFontSizeToFit>D'accord</Text>
                                </TouchableOpacity>
                            )}
                        </Animated.View>
                    </View>
                </Modal>
            )}
        </AlertContext.Provider>
    );
};

export const useCustomAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useCustomAlert must be used within an AlertProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    modalCard: {
        width: '100%',
        maxWidth: 350,
        borderRadius: 24,
        borderWidth: 1,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    iconBadge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontFamily: fonts.bold,
        fontSize: 19,
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontFamily: fonts.regular,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 10,
    },
    btn: {
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    singleBtn: {
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        borderWidth: 1.5,
    },
    confirmBtn: {
        flex: 1.2,
    },
    cancelBtnText: {
        fontFamily: fonts.bold,
        fontSize: 14,
        textAlign: 'center',
    },
    confirmBtnText: {
        fontFamily: fonts.bold,
        fontSize: 14,
        textAlign: 'center',
        color: '#FFFFFF',
    },
});
