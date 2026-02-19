import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { SignOutButton } from '../../components/sign-out-button'

const ProfileScreen = () => {
    const { user } = useUser()

    return (
        <SafeAreaView style={styles.safeAreaStyle}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mon Profil</Text>
            </View>

            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={80} color="#1F7A55" />
                </View>

                <View style={styles.userInfoContainer}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>
                        {user?.primaryEmailAddress?.emailAddress}
                    </Text>
                </View>

                {user?.phoneNumbers[0]?.phoneNumber && (
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.label}>Téléphone</Text>
                        <Text style={styles.value}>
                            {user.phoneNumbers[0].phoneNumber}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.signOutContainer}>
                <SignOutButton />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeAreaStyle: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F3F7F5',
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1F7A55',
        letterSpacing: 0.5,
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D6E3DD',
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    userInfoContainer: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#D6E3DD',
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6B7A78',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2D2A',
    },
    signOutContainer: {
        alignItems: 'center',
    },
})

export default ProfileScreen